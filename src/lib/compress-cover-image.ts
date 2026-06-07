"use client";

import {
  COVER_COMPRESS_MIN_QUALITY,
  COVER_COMPRESS_QUALITY,
  COVER_MAX_DIMENSION,
} from "@/lib/cover-upload-constants";

function outputMime(): "image/webp" | "image/jpeg" {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").startsWith("data:image/webp")
    ? "image/webp"
    : "image/jpeg";
}

function scaledSize(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  if (width >= height) {
    return {
      width: maxDimension,
      height: Math.max(1, Math.round((height * maxDimension) / width)),
    };
  }

  return {
    width: Math.max(1, Math.round((width * maxDimension) / height)),
    height: maxDimension,
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, mime, quality);
  });
}

function compressedFileName(originalName: string, mime: string): string {
  const base = originalName.replace(/\.[^.]+$/, "") || "cover";
  const ext = mime === "image/webp" ? "webp" : "jpg";
  return `${base}.${ext}`;
}

/**
 * Resize and re-encode cover photos in the browser before upload.
 * Skips GIFs and images that are already small enough.
 */
export async function compressCoverImage(
  file: File,
  maxBytes: number
): Promise<File> {
  if (file.type === "image/gif") {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const needsResize =
    bitmap.width > COVER_MAX_DIMENSION || bitmap.height > COVER_MAX_DIMENSION;
  const alreadySmall =
    !needsResize && file.size <= Math.min(maxBytes, 400_000);

  if (alreadySmall) {
    bitmap.close();
    return file;
  }

  const { width, height } = scaledSize(
    bitmap.width,
    bitmap.height,
    COVER_MAX_DIMENSION
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const mime = outputMime();
  let quality = COVER_COMPRESS_QUALITY;
  let blob: Blob | null = null;

  while (quality >= COVER_COMPRESS_MIN_QUALITY) {
    blob = await canvasToBlob(canvas, mime, quality);
    if (!blob) break;
    if (blob.size <= maxBytes) break;
    quality -= 0.1;
  }

  if (!blob) {
    return file;
  }

  if (blob.size >= file.size && file.size <= maxBytes) {
    return file;
  }

  return new File([blob], compressedFileName(file.name, mime), {
    type: mime,
    lastModified: Date.now(),
  });
}
