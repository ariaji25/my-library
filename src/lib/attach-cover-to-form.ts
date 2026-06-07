"use client";

import type { CoverStorageMode } from "@/lib/cover-storage";
import {
  COVER_MAX_BYTES,
  INLINE_COVER_MAX_BYTES,
  isAllowedCoverFile,
} from "@/lib/cover-upload-constants";

type AttachCoverMessages = {
  coverEmpty: string;
  coverSize: string;
  coverType: string;
  coverInlineTooLarge: string;
};

type Options = {
  coverFileId?: string;
  coverImageId?: string;
  messages: AttachCoverMessages;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function clearCoverFileInput(form: HTMLFormElement, coverFileId: string) {
  const coverFileInput = form.elements.namedItem(coverFileId);
  if (coverFileInput instanceof HTMLInputElement) {
    coverFileInput.value = "";
    coverFileInput.files = new DataTransfer().files;
  }
}

export async function attachCoverToForm(
  form: HTMLFormElement,
  file: File,
  mode: CoverStorageMode,
  options: Options
): Promise<{ preview: string; error?: string }> {
  const { messages: m, coverFileId = "coverFile", coverImageId = "coverImage" } =
    options;

  if (file.size === 0) {
    return { preview: "", error: m.coverEmpty };
  }
  if (!isAllowedCoverFile(file)) {
    return { preview: "", error: m.coverType };
  }

  const maxBytes = mode === "inline" ? INLINE_COVER_MAX_BYTES : COVER_MAX_BYTES;
  if (file.size > maxBytes) {
    return {
      preview: "",
      error: mode === "inline" ? m.coverInlineTooLarge : m.coverSize,
    };
  }

  const coverImage = form.elements.namedItem(coverImageId);
  if (!(coverImage instanceof HTMLInputElement)) {
    return { preview: "", error: m.coverEmpty };
  }

  if (mode === "inline") {
    const dataUrl = await fileToDataUrl(file);
    coverImage.value = dataUrl;
    clearCoverFileInput(form, coverFileId);
    return { preview: dataUrl };
  }

  coverImage.value = "";
  const coverFileInput = form.elements.namedItem(coverFileId);
  if (coverFileInput instanceof HTMLInputElement) {
    const transfer = new DataTransfer();
    transfer.items.add(file);
    coverFileInput.files = transfer.files;
  }

  return { preview: URL.createObjectURL(file) };
}
