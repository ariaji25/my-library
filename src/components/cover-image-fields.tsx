"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { attachCoverToForm } from "@/lib/attach-cover-to-form";
import { isDataUrlCover } from "@/lib/cover-inline";
import { isUploadedCoverPath } from "@/lib/cover-path";
import type { CoverStorageMode } from "@/lib/cover-storage";
import { PLACEHOLDER_COVER } from "@/lib/constants";
import { CoverFilePicker } from "@/components/cover-file-picker";
import { useLocale } from "@/components/locale-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  currentCover?: string | null;
  coverImageId?: string;
  coverFileId?: string;
  coverStorage?: CoverStorageMode;
};

export function CoverImageFields({
  currentCover,
  coverImageId = "coverImage",
  coverFileId = "coverFile",
  coverStorage = "disk",
}: Props) {
  const { messages: m } = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayCover = preview ?? currentCover ?? PLACEHOLDER_COVER;
  const showRemove = isUploadedCoverPath(currentCover) && !preview;

  async function handleCoverFile(file: File) {
    setError(null);
    const form = rootRef.current?.closest("form");
    if (!(form instanceof HTMLFormElement)) return;

    try {
      const result = await attachCoverToForm(form, file, coverStorage, {
        coverFileId,
        coverImageId,
        messages: {
          coverEmpty: m.errors.coverEmpty,
          coverSize: m.errors.coverSize,
          coverType: m.errors.coverType,
          coverInlineTooLarge: m.errors.coverInlineTooLarge,
        },
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setPreview(result.preview);
    } catch {
      setError(m.errors.somethingWrong);
    }
  }

  const urlDefault =
    currentCover &&
    !isUploadedCoverPath(currentCover) &&
    !isDataUrlCover(currentCover)
      ? currentCover
      : "";

  return (
    <div ref={rootRef} className="space-y-4 md:col-span-2">
      <Label>{m.bookForm.coverImage}</Label>

      <div className="flex flex-wrap items-start gap-4">
        <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted/40 sm:w-28">
          <Image
            src={displayCover}
            alt={m.bookForm.coverPreview}
            fill
            className="object-cover"
            sizes="112px"
            unoptimized
          />
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-normal text-muted-foreground">
              {m.bookForm.uploadFile}
            </Label>
            <CoverFilePicker
              name={coverStorage === "disk" ? coverFileId : undefined}
              onFile={(file) => void handleCoverFile(file)}
            />
            <p className="text-xs text-muted-foreground">
              {coverStorage === "inline"
                ? m.bookForm.coverInlineHint
                : m.bookForm.uploadHint}
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor={coverImageId}
              className="text-sm font-normal text-muted-foreground"
            >
              {m.bookForm.orImageUrl}
            </Label>
            <Input
              id={coverImageId}
              name="coverImage"
              type="url"
              defaultValue={urlDefault}
              placeholder="https://…"
            />
          </div>

          {showRemove && (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                name="removeCover"
                value="true"
                className="rounded border-border"
              />
              {m.bookForm.removeUploadedCover}
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
