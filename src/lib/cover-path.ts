export function isUploadedCoverPath(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith("/uploads/covers/"));
}
