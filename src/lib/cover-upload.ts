import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateInlineCoverDataUrl } from "@/lib/cover-inline";
import { isUploadedCoverPath } from "@/lib/cover-path";
import { supportsDiskCoverStorage } from "@/lib/cover-storage";
import {
  COVER_MAX_BYTES,
  coverMimeType,
  isAllowedCoverFile,
} from "@/lib/cover-upload-constants";
import { getLocale, getMessages } from "@/lib/i18n/server";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "covers");

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
  const m = getMessages(await getLocale());

  if (!supportsDiskCoverStorage()) {
    throw new Error(m.errors.coverUploadEphemeral);
  }

  if (file.size === 0) {
    throw new Error(m.errors.coverEmpty);
  }
  if (file.size > COVER_MAX_BYTES) {
    throw new Error(m.errors.coverSize);
  }
  if (!isAllowedCoverFile(file)) {
    throw new Error(m.errors.coverType);
  }

  const mime = coverMimeType(file);
  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${extensionForMime(mime)}`;
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
  const m = getMessages(await getLocale());

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
    if (url.startsWith("data:")) {
      validateInlineCoverDataUrl(
        url,
        m.errors.coverInlineTooLarge,
        m.errors.coverType
      );
      if (existingCover && isUploadedCoverPath(existingCover)) {
        await deleteUploadedCover(existingCover);
      }
      return url;
    }

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
