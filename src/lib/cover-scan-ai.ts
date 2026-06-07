import type { Locale } from "@/lib/i18n";

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

export function isGroqCoverScanProvider(baseUrl: string): boolean {
  return baseUrl.includes("groq.com");
}

type VisionRequestBody = {
  model: string;
  messages: Array<{
    role: "user";
    content: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string; detail?: "low" } }
    >;
  }>;
  temperature: number;
  stream: false;
  max_tokens?: number;
  max_completion_tokens?: number;
  response_format?: { type: "json_object" };
};

export function buildCoverScanVisionRequest(
  config: CoverScanConfig,
  prompt: string,
  dataUrl: string
): VisionRequestBody {
  const groq = isGroqCoverScanProvider(config.baseUrl);

  const body: VisionRequestBody = {
    model: config.model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: groq ? { url: dataUrl } : { url: dataUrl, detail: "low" },
          },
        ],
      },
    ],
    temperature: groq ? 0.2 : 0.1,
    stream: false,
  };

  if (groq) {
    // Groq vision + json_object often fails json_validate_failed — parse text instead
    body.max_completion_tokens = 512;
  } else {
    body.max_tokens = 400;
    body.response_format = { type: "json_object" };
  }

  return body;
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
