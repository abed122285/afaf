import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";

const LoginInputSchema = z.object({
  username: z.string().trim().min(3).max(48).regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(8).max(128),
  totpCode: z.string().length(6).optional(),
});

// In-memory sliding window rate limiter per IP + username
const attemptLog = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = attemptLog.get(key);
  if (!entry || now > entry.resetAt) {
    attemptLog.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const body = await req.json();
    const parsed = LoginInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_INPUT", message: "Invalid username or password format" } },
        { status: 422 }
      );
    }

    const { username, password } = parsed.data;
    const rateKey = `${ip}:${username.toLowerCase()}`;
    if (!checkRateLimit(rateKey)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many login attempts. Please wait 15 minutes before retrying.",
          },
        },
        { status: 429 }
      );
    }

    // 1. Resolve username to internal_auth_email on the server (never exposed to client)
    const adminClient = createSupabaseServiceRoleClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id, organization_id, username, internal_auth_email, full_name, account_type, is_active, mfa_enabled, session_version")
      .eq("username", username.toLowerCase())
      .maybeSingle();

    // Generic error message prevents username enumeration
    if (!profile || !profile.is_active) {
      return NextResponse.json(
        { ok: false, error: { code: "AUTH_FAILED", message: "Invalid credentials or inactive account" } },
        { status: 401 }
      );
    }

    // 2. Authenticate with Supabase Auth using the resolved internal email
    const supabase = createSupabaseServerClient();
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: profile.internal_auth_email,
      password,
    });

    if (authErr || !authData.user) {
      await adminClient.from("audit_logs").insert({
        organization_id: profile.organization_id,
        actor_user_id: profile.id,
        actor_username: profile.username,
        actor_role: profile.account_type,
        event_category: "AUTH",
        action_code: "LOGIN_FAILED",
        entity_type: "PROFILE",
        entity_id: profile.id,
        summary_ar: `محاولة دخول فاشلة للمستخدم ${profile.username}`,
        summary_fr: `Échec de connexion pour l'utilisateur ${profile.username}`,
        ip_address: ip,
      });

      return NextResponse.json(
        { ok: false, error: { code: "AUTH_FAILED", message: "Invalid credentials or inactive account" } },
        { status: 401 }
      );
    }

    // Clear rate limit on success & record login timestamp + audit log
    attemptLog.delete(rateKey);
    await adminClient
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", profile.id);

    await adminClient.from("audit_logs").insert({
      organization_id: profile.organization_id,
      actor_user_id: profile.id,
      actor_username: profile.username,
      actor_role: profile.account_type,
      event_category: "AUTH",
      action_code: "LOGIN_SUCCESS",
      entity_type: "PROFILE",
      entity_id: profile.id,
      summary_ar: `تسجيل دخول ناجح للمستخدم ${profile.username}`,
      summary_fr: `Connexion réussie pour ${profile.username}`,
      ip_address: ip,
    });

    // Return sanitized profile without internal_auth_email
    return NextResponse.json({
      ok: true,
      user: {
        id: profile.id,
        organizationId: profile.organization_id,
        username: profile.username,
        fullName: profile.full_name,
        accountType: profile.account_type,
        isActive: profile.is_active,
        mfaEnabled: profile.mfa_enabled,
        sessionVersion: profile.session_version,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "AUTH_ERROR", message: "Authentication service unavailable" } },
      { status: 500 }
    );
  }
}
