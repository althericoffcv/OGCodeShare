import { createCanvas, loadImage, type Image, type SKRSContext2D } from "@napi-rs/canvas";
import { SnippetOgInput } from "@/lib/types/og";
import { fitTitle, wrapText, drawImageCover } from "../layout";
import {
  OG_WIDTH,
  OG_HEIGHT,
  drawNeoBrutalistBase,
  drawBadge,
  drawDividerAndDomain,
  drawActionButton,
  drawFaviconBadge,
  getFaviconImage,
} from "./common";
import { ensureFontsRegistered } from "../fonts";
import { fetchSafeImage } from "@/lib/security/image-fetcher";

/**
 * Renders a clean neo-brutalist code box graphic when no author image is provided
 */
function drawCodeSnippetFallback(
  ctx: SKRSContext2D,
  snippetName: string,
  dx: number,
  dy: number,
  dw: number,
  dh: number
): void {
  ctx.save();

  // Dark background card
  ctx.fillStyle = "#1E1E2E";
  ctx.beginPath();
  ctx.roundRect(dx, dy, dw, dh, 16);
  ctx.fill();

  // 3px solid black border
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000000";
  ctx.stroke();

  // Mac-style window dots (offset to avoid overlapping with favicon at top-left)
  const dotsY = dy + 28;
  const dotsStartX = dx + dw - 75;
  const dotRadius = 6;
  const dotColors = ["#EF4444", "#F59E0B", "#10B981"];

  dotColors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(dotsStartX + i * 20, dotsY, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Code snippet simulated lines
  ctx.fillStyle = "#A6ADC8";
  ctx.font = "600 16px 'Courier New', monospace";
  ctx.textBaseline = "top";

  const codeLines = [
    "// Code Share Zone Snippet",
    "import { createSnippet } from '@/lib';",
    "",
    "export async function execute() {",
    "  const status = await run();",
    "  return { success: true };",
    "}",
  ];

  let lineY = dy + 110;
  for (const line of codeLines) {
    if (line.startsWith("//")) {
      ctx.fillStyle = "#6C7086";
    } else if (line.startsWith("import") || line.startsWith("export") || line.startsWith("return")) {
      ctx.fillStyle = "#CBA6F7";
    } else {
      ctx.fillStyle = "#CDD6F4";
    }
    ctx.fillText(line, dx + 35, lineY);
    lineY += 28;
  }

  // Snippet name pill at bottom of code preview
  ctx.fillStyle = "#313244";
  ctx.beginPath();
  ctx.roundRect(dx + 30, dy + dh - 60, dw - 60, 36, 8);
  ctx.fill();

  ctx.fillStyle = "#F9E2AF";
  ctx.font = "bold 14px Inter, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(`⚡ ${snippetName.slice(0, 32)}`, dx + 45, dy + dh - 42);

  ctx.restore();
}

/**
 * Renders the Snippet OG Image (1200x630) using @napi-rs/canvas
 */
export async function renderSnippetOg(input: SnippetOgInput): Promise<Buffer> {
  ensureFontsRegistered();

  const canvas = createCanvas(OG_WIDTH, OG_HEIGHT);
  const ctx = canvas.getContext("2d");

  const bgColor = input.backgroundColor || "#FFC900";
  const buttonText = input.buttonText || "Get Snippet";

  // 1. Draw Background and Main Card Panel
  drawNeoBrutalistBase(ctx, bgColor);

  // Left Column Boundaries
  const leftX = 100;
  const colWidth = 490;

  // 2. Draw "Code Share Zone" Badge
  const badgeBottom = drawBadge(ctx, leftX, 102);

  // 3. Draw Title (auto fit/wrap)
  const titleY = badgeBottom + 26;
  const titleFit = fitTitle(ctx, input.name, colWidth, 42, 28, 2);

  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.font = `bold ${titleFit.fontSize}px Inter, sans-serif`;
  ctx.textBaseline = "top";

  let currentY = titleY;
  for (const line of titleFit.lines) {
    ctx.fillText(line, leftX, currentY);
    currentY += titleFit.lineHeight;
  }
  ctx.restore();

  // 4. Draw Description
  const descY = currentY + 14;
  ctx.save();
  ctx.fillStyle = "#4B5563";
  ctx.font = "400 18px Inter, sans-serif";
  ctx.textBaseline = "top";

  const dividerY = 430;
  const descLines = wrapText(ctx, input.description, colWidth, 3);
  let descLineY = descY;
  for (const line of descLines) {
    if (descLineY + 26 > dividerY - 10) break;
    ctx.fillText(line, leftX, descLineY);
    descLineY += 26;
  }
  ctx.restore();

  // 5. Draw Divider & Domain
  drawDividerAndDomain(ctx, leftX, dividerY, colWidth, "codeshare.zone.id");

  // 6. Draw Action Button & Author
  const bottomY = 530;
  const btn = drawActionButton(ctx, buttonText, leftX + colWidth, bottomY);

  // Author on the left
  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "middle";

  const maxAuthorWidth = btn.x - leftX - 20;
  let authorFontSize = 28;
  while (authorFontSize >= 16) {
    ctx.font = `bold ${authorFontSize}px Inter, sans-serif`;
    if (ctx.measureText(input.author).width <= maxAuthorWidth) break;
    authorFontSize -= 2;
  }

  const authorY = btn.y + btn.height / 2;
  ctx.fillText(input.author, leftX, authorY);
  ctx.restore();

  // 7. Right Column: Image Box
  // Reference spec: x=623 to 1103 (width 480), y=100 to 531 (height 431)
  const imgX = 623;
  const imgY = 100;
  const imgW = 480;
  const imgH = 431;

  let loadedImg: Image | null = null;
  if (input.authorImage && input.authorImage.trim().length > 0) {
    const fetched = await fetchSafeImage(input.authorImage);
    loadedImg = await loadImage(fetched.buffer);
  }

  if (loadedImg) {
    drawImageCover(ctx, loadedImg, imgX, imgY, imgW, imgH, 16, 3, "#000000");
  } else {
    // Beautiful code snippet fallback
    drawCodeSnippetFallback(ctx, input.name, imgX, imgY, imgW, imgH);
  }

  // 8. Favicon C overlay on top-left of image box
  const faviconImg = await getFaviconImage();
  drawFaviconBadge(ctx, faviconImg, imgX, imgY);

  return canvas.toBuffer("image/png");
}
