import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { isUploadedCoverPath } from "@/lib/cover-path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "covers");
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export { isUploadedCoverPath } from "@/lib/cover-path";

function extensionForMime(type: string): string {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

export async function saveCoverUpload(file: File): Promise<string> {
  if (file.size === 0) {
    throw new Error("Cover file is empty");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Cover image must be 5 MB or smaller");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Cover must be JPEG, PNG, WebP, or GIF");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${extensionForMime(file.type)}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return `/uploads/covers/${filename}`;
}

export async function deleteUploadedCover(url: string | null | undefined) {
  if (!isUploadedCoverPath(url)) return;

  const filePath = path.join(process.cwd(), "public", url!);
  try {
    await unlink(filePath);
  } catch {
    // File may already be gone
  }
}

export async function resolveCoverFromFormData(
  formData: FormData,
  existingCover?: string | null
): Promise<string | null> {
  const file = formData.get("coverFile");
  if (file instanceof File && file.size > 0) {
    const saved = await saveCoverUpload(file);
    if (existingCover && existingCover !== saved) {
      await deleteUploadedCover(existingCover);
    }
    return saved;
  }

  if (formData.get("removeCover") === "true") {
    await deleteUploadedCover(existingCover);
    return null;
  }

  const url = String(formData.get("coverImage") ?? "").trim();
  if (url) {
    if (
      existingCover &&
      isUploadedCoverPath(existingCover) &&
      existingCover !== url
    ) {
      await deleteUploadedCover(existingCover);
    }
    return url;
  }

  return existingCover ?? null;
}
