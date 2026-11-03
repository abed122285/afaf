import fs from "fs/promises";
import path from "path";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from "./validators";

export interface StoredMediaAsset {
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface StorageProvider {
  uploadImage(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<StoredMediaAsset>;
  deleteImage(url: string): Promise<void>;
}

export class LocalDiskStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor(uploadDir = process.env.LOCAL_UPLOAD_DIR || "./public/uploads") {
    this.uploadDir = uploadDir;
  }

  async uploadImage(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<StoredMediaAsset> {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as any)) {
      throw new Error(`Unsupported image format: ${mimeType}. Allowed: JPG, PNG, WebP.`);
    }
    if (fileBuffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
      throw new Error(`Image size exceeds maximum limit of 10 MB.`);
    }
    await fs.mkdir(this.uploadDir, { recursive: true });
    const safeName = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const fullPath = path.join(this.uploadDir, safeName);
    await fs.writeFile(fullPath, fileBuffer);
    return {
      url: `/uploads/${safeName}`,
      fileName: safeName,
      mimeType,
      sizeBytes: fileBuffer.byteLength,
    };
  }

  async deleteImage(url: string): Promise<void> {
    if (!url.startsWith("/uploads/")) return;
    const fileName = path.basename(url);
    const fullPath = path.join(this.uploadDir, fileName);
    await fs.unlink(fullPath).catch(() => undefined);
  }
}

export const storageProvider: StorageProvider = new LocalDiskStorageProvider();
