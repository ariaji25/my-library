import { formatReadingDuration } from "@/lib/reading-stats";

export type ReadingProgressExportData = {
  bookName: string;
  pagesRead: number;
  totalPages: number | null;
  minutesRead: number;
  quote: string | null;
};

const MAX_WIDTH = 480;
const PADDING_X = 40;
const PADDING_Y = 32;
const LINE_GAP = 12;
const TEXT = "#ffffff";
const PRIMARY = "#e879a9";
/** Lucide BookOpen — 24×24 viewBox */
const ICON_SIZE = 48;
const ICON_TOP_GAP = 28;
const BOOK_OPEN_PATHS = [
  "M12 7v14",
  "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
];

type TextLine = {
  text: string;
  font: string;
  lineHeight: number;
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length > 0 ? lines : [text];
}

function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60) || "book";
}

function pagesLine(pagesRead: number, totalPages: number | null): string {
  if (totalPages && totalPages > 0) {
    return `${pagesRead} / ${totalPages} pages`;
  }
  return `${pagesRead} pages`;
}

function buildLines(
  ctx: CanvasRenderingContext2D,
  data: ReadingProgressExportData
): TextLine[] {
  const maxTextWidth = MAX_WIDTH - PADDING_X * 2;
  const lines: TextLine[] = [];

  lines.push({
    text: formatReadingDuration(data.minutesRead),
    font: "500 22px system-ui, sans-serif",
    lineHeight: 30,
  });

  lines.push({
    text: pagesLine(data.pagesRead, data.totalPages),
    font: "500 22px system-ui, sans-serif",
    lineHeight: 30,
  });

  ctx.font = "600 24px Georgia, serif";
  for (const titleLine of wrapText(ctx, data.bookName, maxTextWidth)) {
    lines.push({
      text: titleLine,
      font: "600 24px Georgia, serif",
      lineHeight: 32,
    });
  }

  const quote = data.quote?.trim();
  if (quote) {
    ctx.font = "italic 20px Georgia, serif";
    for (const quoteLine of wrapText(ctx, `\u201C${quote}\u201D`, maxTextWidth)) {
      lines.push({
        text: quoteLine,
        font: "italic 20px Georgia, serif",
        lineHeight: 28,
      });
    }
  }

  return lines;
}

function measureCanvas(lines: TextLine[]): { width: number; height: number } {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return { width: MAX_WIDTH, height: 200 };

  let maxWidth = 0;
  let height = PADDING_Y;

  for (let i = 0; i < lines.length; i++) {
    ctx.font = lines[i].font;
    maxWidth = Math.max(maxWidth, ctx.measureText(lines[i].text).width);
    height += lines[i].lineHeight;
    if (i < lines.length - 1) height += LINE_GAP;
  }

  maxWidth = Math.max(maxWidth, ICON_SIZE);

  height += ICON_TOP_GAP + ICON_SIZE + PADDING_Y;

  return {
    width: Math.ceil(Math.min(MAX_WIDTH, maxWidth + PADDING_X * 2)),
    height: Math.ceil(height),
  };
}

function drawBookIcon(ctx: CanvasRenderingContext2D, centerX: number, y: number) {
  const scale = ICON_SIZE / 24;
  ctx.save();
  ctx.translate(centerX - ICON_SIZE / 2, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = PRIMARY;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const d of BOOK_OPEN_PATHS) {
    ctx.stroke(new Path2D(d));
  }
  ctx.restore();
}

export function downloadReadingProgressPng(data: ReadingProgressExportData) {
  if (typeof document === "undefined") return;

  const measureCtx = document.createElement("canvas").getContext("2d");
  if (!measureCtx) return;

  const lines = buildLines(measureCtx, data);
  const { width, height } = measureCanvas(lines);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = width;
  canvas.height = height;

  const centerX = width / 2;
  let y = PADDING_Y;

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = TEXT;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    ctx.font = line.font;
    ctx.fillText(line.text, centerX, y);
    y += line.lineHeight + (i < lines.length - 1 ? LINE_GAP : 0);
  }

  y += ICON_TOP_GAP;
  drawBookIcon(ctx, centerX, y);

  const link = document.createElement("a");
  link.download = `${sanitizeFilename(data.bookName)}-reading.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
