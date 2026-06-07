export const COVER_MAX_BYTES = 5 * 1024 * 1024;

/** Vercel / inline storage — keeps server-action body under 5 MB */
export const INLINE_COVER_MAX_BYTES = 2 * 1024 * 1024;

/** Resize longer edge before upload (display max ~240px; 1200px keeps covers sharp on retina). */
export const COVER_MAX_DIMENSION = 1200;

export const COVER_COMPRESS_QUALITY = 0.85;
export const COVER_COMPRESS_MIN_QUALITY = 0.55;

export const COVER_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const COVER_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "heic",
  "heif",
]);

export function isAllowedCoverFile(file: File): boolean {
  if (COVER_ALLOWED_TYPES.has(file.type)) return true;
  if (file.type) return false;

  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext ? COVER_EXTENSIONS.has(ext) : true;
}

export function coverMimeType(file: File): string {
  if (file.type) return file.type;

  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    default:
      return "image/jpeg";
  }
}
