export type CoverStorageMode = "disk" | "inline";

/** disk = public/uploads (Docker/local); inline = data URL in DB (Vercel) */
export function getCoverStorageMode(): CoverStorageMode {
  return process.env.VERCEL === "1" ? "inline" : "disk";
}

export function supportsDiskCoverStorage(): boolean {
  return getCoverStorageMode() === "disk";
}
