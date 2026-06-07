import { INLINE_COVER_MAX_BYTES } from "@/lib/cover-upload-constants";

export function isDataUrlCover(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith("data:image/"));
}

export function dataUrlByteSize(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.ceil((base64.length * 3) / 4);
}

export function validateInlineCoverDataUrl(
  dataUrl: string,
  tooLargeMessage: string,
  invalidMessage: string
): void {
  if (!isDataUrlCover(dataUrl)) {
    throw new Error(invalidMessage);
  }

  if (dataUrlByteSize(dataUrl) > INLINE_COVER_MAX_BYTES) {
    throw new Error(tooLargeMessage);
  }
}
