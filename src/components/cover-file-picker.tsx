"use client";

import { useId, useRef } from "react";
import { Camera, ImageUp } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPT = "image/*";

type Props = {
  onFile?: (file: File) => void;
  disabled?: boolean;
  /** Named input for multipart forms; camera/gallery inputs copy into this one. */
  name?: string;
  className?: string;
  layout?: "buttons" | "stacked";
};

function clearInputs(...inputs: Array<HTMLInputElement | null>) {
  for (const input of inputs) {
    if (input) input.value = "";
  }
}

export function CoverFilePicker({
  onFile,
  disabled = false,
  name,
  className,
  layout = "buttons",
}: Props) {
  const { messages: m } = useLocale();
  const baseId = useId();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLInputElement>(null);

  const cameraId = `${baseId}-camera`;
  const galleryId = `${baseId}-gallery`;

  function deliver(file: File, source: HTMLInputElement) {
    if (name && formRef.current) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      formRef.current.files = transfer.files;
    }
    if (onFile) onFile(file);
    clearInputs(
      source === cameraRef.current ? galleryRef.current : cameraRef.current,
      source
    );
  }

  function onInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
    source: HTMLInputElement
  ) {
    const file = e.target.files?.[0];
    if (file) deliver(file, source);
  }

  const stacked = layout === "stacked";
  const labelClass = cn(
    buttonVariants({ variant: "secondary" }),
    "cursor-pointer",
    stacked && "flex-1 justify-center",
    disabled && "pointer-events-none opacity-50"
  );

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={cameraRef}
        id={cameraId}
        type="file"
        accept={ACCEPT}
        capture="environment"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          if (cameraRef.current) onInputChange(e, cameraRef.current);
        }}
      />
      <input
        ref={galleryRef}
        id={galleryId}
        type="file"
        accept={ACCEPT}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          if (galleryRef.current) onInputChange(e, galleryRef.current);
        }}
      />
      {name && (
        <input
          ref={formRef}
          type="file"
          name={name}
          accept={ACCEPT}
          className="hidden"
          tabIndex={-1}
          aria-hidden
        />
      )}

      <div
        className={cn(
          stacked ? "flex flex-col gap-2 sm:flex-row" : "flex flex-wrap gap-2"
        )}
      >
        <label htmlFor={cameraId} className={labelClass}>
          <Camera className="h-4 w-4" />
          {m.bookForm.takePhoto}
        </label>
        <label htmlFor={galleryId} className={labelClass}>
          <ImageUp className="h-4 w-4" />
          {m.bookForm.chooseImage}
        </label>
      </div>
      {!disabled && (
        <p className="text-xs text-muted-foreground">
          {m.bookForm.cameraPermissionHint}
        </p>
      )}
    </div>
  );
}
