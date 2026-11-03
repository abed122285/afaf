import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";

const CreateEmployeeSchema = z.object({
  username: z.string().trim().min(3).max(48).regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(10).max(128),
  fullName: z.string().min(2).max(120),
  roleCode: z.enum(["PRODUCTION_MANAGER", "SALES_CASHIER", "INVENTORY_PURCHASING", "ACCOUNTANT_FINANCE"]),
  jobTitleAr: z.string().max(120).optional().default(""),
  jobTitleFr: z.string().max(120).optional().default(""),
  phone: z.string().max(40).optional().default(""),
  customPermissionsGrant: z.array(z.string()).optional().default([]),
  customPermissionsDeny: z.array(z.string()).optional().default([]),
});

const UpdateEmployeeAccessSchema = z.object({
  employeeId: z.string().uuid(),
  isActive: z.boolean().optional(),
  revokeSessions: z.boolean().optional(),
  roleCode: z.string().optional(),
  customPermissionsGrant: z.array(z.string()).optional(),
  customPermissionsDeny: z.array(z.string()).optional(),
});

async function verifyCallerCanManageEmployees() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, organization_id, username, account_type, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) return null;
  if (profile.account_type === "OWNER") return profile;

  const { data: hasPerm } = await supabase.rpc("has_atelier_permission" as any, {
    target_org_id: profile.organization_id,
    required_perm: "employees.manage",
  });
  return hasPerm ? profile : null;
}

export async function POST(req: NextRequest) {
  try {
    const caller = await verifyCallerCanManageEmployees();
    if (!caller) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Only the Owner or authorized administrators can manage employee accounts" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = CreateEmployeeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid employee payload", details: parsed.error.flatten() } },
        { status: 422 }
      );
    }

    const data = parsed.data;
    const uname = data.username.toLowerCase();
    const internalEmail = `${uname}@atelier.afafelassli.dz`;
    const admin = createSupabaseServiceRoleClient();

    // 1. Create Supabase Auth user with password managed by Supabase Auth
    const { data: createdAuth, error: authErr } = await admin.auth.admin.createUser({
      email: internalEmail,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        username: uname,
        full_name: data.fullName,
        account_type: "EMPLOYEE",
      },
    });

    if (authErr || !createdAuth.user) {
      return NextResponse.json(
        { ok: false, error: { code: "CREATE_AUTH_FAILED", message: authErr?.message || "Failed to create employee credentials" } },
        { status: 409 }
      );
    }

    const empId = createdAuth.user.id;
    const { data: roleRecord } = await admin
      .from("roles")
      .select("id")
      .eq("organization_id", caller.organization_id)
      .eq("code", data.roleCode)
      .single();

    if (!roleRecord) {
      throw new Error(`Role ${data.roleCode} not found`);
    }

    // 2. Create Profile, Membership & Role Assignment (Employee can NEVER be created as OWNER)
    await admin.from("profiles").insert({
      id: empId,
      organization_id: caller.organization_id,
      username: uname,
      internal_auth_email: internalEmail,
      full_name: data.fullName,
      account_type: "EMPLOYEE",
      job_title_ar: data.jobTitleAr,
      job_title_fr: data.jobTitleFr,
      phone: data.phone,
      is_active: true,
      created_by: caller.id,
    });

    await admin.from("memberships").insert({
      organization_id: caller.organization_id,
      user_id: empId,
      is_owner: false,
      status: "ACTIVE",
    });

    await admin.from("user_role_assignments").insert({
      organization_id: caller.organization_id,
      user_id: empId,
      role_id: roleRecord.id,
      custom_permissions_grant: data.customPermissionsGrant,
      custom_permissions_deny: data.customPermissionsDeny,
      assigned_by: caller.id,
    });

    await admin.from("audit_logs").insert({
      organization_id: caller.organization_id,
      actor_user_id: caller.id,
      actor_username: caller.username,
      actor_role: caller.account_type,
      event_category: "RBAC",
      action_code: "EMPLOYEE_CREATED",
      entity_type: "PROFILE",
      entity_id: empId,
      summary_ar: `إنشاء حساب موظف جديد (${uname}) بدور ${data.roleCode}`,
      summary_fr: `Création du compte employé (${uname}) avec le rôle ${data.roleCode}`,
    });

    return NextResponse.json(
      { ok: true, employee: { id: empId, username: uname, fullName: data.fullName, roleCode: data.roleCode, isActive: true } },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: err?.message || "Failed to create employee" } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const caller = await verifyCallerCanManageEmployees();
    if (!caller) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Unauthorized" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = UpdateEmployeeAccessSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid update payload" } },
        { status: 422 }
      );
    }

    const { employeeId, isActive, revokeSessions, customPermissionsGrant, customPermissionsDeny } = parsed.data;
    const admin = createSupabaseServiceRoleClient();

    // Prevent modifying Owner account status or self-lockout
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("id, username, account_type, session_version")
      .eq("id", employeeId)
      .eq("organization_id", caller.organization_id)
      .single();

    if (!targetProfile || targetProfile.account_type === "OWNER") {
      return NextResponse.json(
        { ok: false, error: { code: "PROTECTED_OWNER", message: "Owner account cannot be deactivated or demoted" } },
        { status: 403 }
      );
    }

    const nextSessionVersion = revokeSessions || isActive === false ? targetProfile.session_version + 1 : targetProfile.session_version;

    await admin
      .from("profiles")
      .update({
        ...(typeof isActive === "boolean" ? { is_active: isActive } : {}),
        session_version: nextSessionVersion,
        updated_at: new Date().toISOString(),
      })
      .eq("id", employeeId);

    if (typeof isActive === "boolean") {
      await admin
        .from("memberships")
        .update({ status: isActive ? "ACTIVE" : "SUSPENDED", updated_at: new Date().toISOString() })
        .eq("user_id", employeeId)
        .eq("organization_id", caller.organization_id);
    }

    if (customPermissionsGrant || customPermissionsDeny) {
      await admin
        .from("user_role_assignments")
        .update({
          ...(customPermissionsGrant ? { custom_permissions_grant: customPermissionsGrant } : {}),
          ...(customPermissionsDeny ? { custom_permissions_deny: customPermissionsDeny } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", employeeId)
        .eq("organization_id", caller.organization_id);
    }

    if (revokeSessions || isActive === false) {
      await admin.auth.admin.signOut(employeeId);
    }

    await admin.from("audit_logs").insert({
      organization_id: caller.organization_id,
      actor_user_id: caller.id,
      actor_username: caller.username,
      actor_role: caller.account_type,
      event_category: "RBAC",
      action_code: isActive === false ? "EMPLOYEE_DEACTIVATED" : revokeSessions ? "SESSION_REVOKED" : "PERMISSIONS_UPDATED",
      entity_type: "PROFILE",
      entity_id: employeeId,
      summary_ar: `تحديث صلاحيات/حالة حساب الموظف (${targetProfile.username})`,
      summary_fr: `Mise à jour des accès de l'employé (${targetProfile.username})`,
    });

    return NextResponse.json({ ok: true, employeeId, isActive, sessionVersion: nextSessionVersion });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: err?.message || "Failed to update employee" } },
      { status: 500 }
    );
  }
}
