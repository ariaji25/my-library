import Image from "next/image";
import { isUploadedCoverPath } from "@/lib/cover-path";
import { PLACEHOLDER_COVER } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  currentCover?: string | null;
  coverImageId?: string;
  coverFileId?: string;
};

export function CoverImageFields({
  currentCover,
  coverImageId = "coverImage",
  coverFileId = "coverFile",
}: Props) {
  const preview = currentCover || PLACEHOLDER_COVER;
  const showRemove = isUploadedCoverPath(currentCover);

  return (
    <div className="space-y-4 md:col-span-2">
      <Label>Cover image</Label>

      <div className="flex flex-wrap items-start gap-4">
        <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted/40 sm:w-28">
          <Image
            src={preview}
            alt="Cover preview"
            fill
            className="object-cover"
            sizes="112px"
            unoptimized
          />
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor={coverFileId}
              className="text-sm font-normal text-muted-foreground"
            >
              Upload file
            </Label>
            <Input
              id={coverFileId}
              name="coverFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
            />
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP, or GIF · max 5 MB
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor={coverImageId}
              className="text-sm font-normal text-muted-foreground"
            >
              Or image URL
            </Label>
            <Input
              id={coverImageId}
              name="coverImage"
              type="url"
              defaultValue={
                currentCover && !isUploadedCoverPath(currentCover)
                  ? currentCover
                  : ""
              }
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
              Remove uploaded cover
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
