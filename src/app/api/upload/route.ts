import { NextRequest, NextResponse } from "next/server";
import { saveUploadedImage } from "@/lib/storage";
import { db } from "@/db";
import { attachments, activityLogs } from "@/db/schema";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export function verifyImageMagicBytes(buf: Uint8Array, declaredMime: string): boolean {
  if (buf.length < 12) return false;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (declaredMime === "image/png") {
    return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  }
  // JPEG: FF D8 FF
  if (declaredMime === "image/jpeg") {
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  // WEBP: RIFF....WEBP
  if (declaredMime === "image/webp") {
    return (
      buf[0] === 0x52 &&
      buf[1] === 0x49 &&
      buf[2] === 0x46 &&
      buf[3] === 0x46 &&
      buf[8] === 0x57 &&
      buf[9] === 0x45 &&
      buf[10] === 0x42 &&
      buf[11] === 0x50
    );
  }
  return false;
}

export function sanitizeEntityName(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48) || "MATERIAL";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const entityType = sanitizeEntityName((formData.get("entityType") as string) || "MATERIAL");
    const entityId = sanitizeEntityName((formData.get("entityId") as string) || "UNASSIGNED");

    if (!file) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_FILE", message: "No image file provided" } },
        { status: 400 }
      );
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNSUPPORTED_MEDIA_TYPE",
            message: `Unsupported image type: ${file.type}. Allowed: PNG, JPG, WEBP.`,
          },
        },
        { status: 415 }
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "PAYLOAD_TOO_LARGE", message: "File exceeds 5MB maximum limit" },
        },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    if (!verifyImageMagicBytes(uint8, file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_MAGIC_BYTES",
            message: "File binary header does not match declared image MIME type.",
          },
        },
        { status: 422 }
      );
    }

    const saved = await saveUploadedImage(file, entityType.toLowerCase());
    let attachmentRecord = null;
    try {
      const [inserted] = await db
        .insert(attachments)
        .values({
          entityType,
          entityId,
          fileName: saved.fileName,
          fileUrl: saved.publicUrl,
          mimeType: saved.mimeType,
          fileSize: saved.sizeBytes,
        })
        .returning();
      attachmentRecord = inserted;

      await db.insert(activityLogs).values({
        actionType: "UPLOAD_ATTACHMENT",
        entityType,
        entityId,
        summaryAr: `رفع صورة مرفقة (${saved.fileName})`,
        summaryFr: `Image téléversée (${saved.fileName})`,
      });
    } catch {
      attachmentRecord = {
        id: `ATT-${Date.now()}`,
        entityType,
        entityId,
        fileName: saved.fileName,
        fileUrl: saved.publicUrl,
        mimeType: saved.mimeType,
        fileSize: saved.sizeBytes,
      };
    }

    return NextResponse.json({ ok: true, data: attachmentRecord }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "UPLOAD_FAILED", message: err?.message || "Image upload failed" } },
      { status: 500 }
    );
  }
}
