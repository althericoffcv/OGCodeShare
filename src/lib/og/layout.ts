import type { SKRSContext2D, Image } from "@napi-rs/canvas";

export interface WrappedTextResult {
  lines: string[];
  lineHeight: number;
  totalHeight: number;
}

/**
 * Wraps text into lines constrained by maxWidth and maxLines.
 * If text exceeds maxLines, it appends ellipsis '...' to the last line.
 */
export function wrapText(
  ctx: SKRSContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 3
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = `${currentLine} ${word}`;
    const metrics = ctx.measureText(testLine);

    if (metrics.width <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      if (lines.length === maxLines) {
        break;
      }
      currentLine = word;
    }
  }

  if (lines.length < maxLines && currentLine) {
    lines.push(currentLine);
  } else if (lines.length === maxLines && words.length > lines.join(" ").split(/\s+/).length) {
    // Add ellipsis if remaining words were truncated
    let last = lines[lines.length - 1];
    while (last.length > 0 && ctx.measureText(`${last}...`).width > maxWidth) {
      last = last.slice(0, -1).trim();
    }
    lines[lines.length - 1] = `${last}...`;
  }

  return lines;
}

/**
 * Auto-scales title font size and wraps it into at most maxLines (default 2).
 */
export function fitTitle(
  ctx: SKRSContext2D,
  title: string,
  maxWidth: number,
  initialFontSize: number = 42,
  minFontSize: number = 26,
  maxLines: number = 2
): { lines: string[]; fontSize: number; lineHeight: number } {
  let fontSize = initialFontSize;

  while (fontSize >= minFontSize) {
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    const singleLineWidth = ctx.measureText(title).width;

    if (singleLineWidth <= maxWidth) {
      return {
        lines: [title],
        fontSize,
        lineHeight: Math.round(fontSize * 1.15),
      };
    }

    const wrapped = wrapText(ctx, title, maxWidth, maxLines);
    if (wrapped.length <= maxLines && fontSize > minFontSize) {
      // Check if it fits nicely
      const allFit = wrapped.every((line) => ctx.measureText(line).width <= maxWidth);
      if (allFit) {
        return {
          lines: wrapped,
          fontSize,
          lineHeight: Math.round(fontSize * 1.18),
        };
      }
    }

    fontSize -= 2;
  }

  // Minimum font size reached, wrap with ellipsis on maxLines
  ctx.font = `bold ${minFontSize}px Inter, sans-serif`;
  const fallbackLines = wrapText(ctx, title, maxWidth, maxLines);
  return {
    lines: fallbackLines,
    fontSize: minFontSize,
    lineHeight: Math.round(minFontSize * 1.18),
  };
}

/**
 * Draws an image with object-fit: cover inside a bounded rectangle with rounded corners
 * and optional border.
 */
export function drawImageCover(
  ctx: SKRSContext2D,
  image: Image,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  radius: number = 16,
  borderWidth: number = 3,
  borderColor: string = "#000000"
): void {
  ctx.save();

  // Create clipping rounded rect
  ctx.beginPath();
  ctx.roundRect(dx, dy, dw, dh, radius);
  ctx.clip();

  // Calculate object-fit: cover crop box
  const imgW = image.width;
  const imgH = image.height;
  const imgRatio = imgW / imgH;
  const targetRatio = dw / dh;

  let sx = 0;
  let sy = 0;
  let sw = imgW;
  let sh = imgH;

  if (imgRatio > targetRatio) {
    // Image is wider than target: crop horizontally
    sw = imgH * targetRatio;
    sx = (imgW - sw) / 2;
  } else {
    // Image is taller than target: crop vertically
    sh = imgW / targetRatio;
    sy = (imgH - sh) / 2;
  }

  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.restore();

  // Draw border around the rounded image box
  if (borderWidth > 0) {
    ctx.save();
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColor;
    ctx.beginPath();
    ctx.roundRect(dx, dy, dw, dh, radius);
    ctx.stroke();
    ctx.restore();
  }
}
