const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

export type CoverScanConfig = {
  apiKey: string;
  model: string;
  baseUrl: string;
};

export function isCoverScanConfigured(): boolean {
  return Boolean(process.env.COVER_SCAN_API_KEY?.trim());
}

export function getCoverScanConfig(): CoverScanConfig | null {
  const apiKey = process.env.COVER_SCAN_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    apiKey,
    model: process.env.COVER_SCAN_MODEL?.trim() || DEFAULT_MODEL,
    baseUrl: (
      process.env.COVER_SCAN_BASE_URL?.trim() || DEFAULT_BASE_URL
    ).replace(/\/$/, ""),
  };
}

export class CoverScanError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_CONFIGURED" | "API_ERROR" | "INVALID_RESPONSE"
  ) {
    super(message);
    this.name = "CoverScanError";
  }
}
