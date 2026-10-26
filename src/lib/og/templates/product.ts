import { createCanvas, loadImage, type Image } from "@napi-rs/canvas";
import { ProductOgInput } from "@/lib/types/og";
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
 * Renders the Product OG Image (1200x630) using @napi-rs/canvas
 */
export async function renderProductOg(input: ProductOgInput): Promise<Buffer> {
  ensureFontsRegistered();

  const canvas = createCanvas(OG_WIDTH, OG_HEIGHT);
  const ctx = canvas.getContext("2d");

  const bgColor = input.backgroundColor || "#9700FF";
  const buttonText = input.buttonText || "Buy Now";

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

  // Calculate available height for description before divider (divider at y ~ 420)
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

  // 6. Draw Action Button & Price
  const bottomY = 530;
  const btn = drawActionButton(ctx, buttonText, leftX + colWidth, bottomY);

  // Price on the left
  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.font = "bold 32px Inter, sans-serif";
  ctx.textBaseline = "middle";

  // Auto-shrink price font if very long so it never collides with button
  const maxPriceWidth = btn.x - leftX - 20;
  let priceFontSize = 32;
  while (priceFontSize >= 18) {
    ctx.font = `bold ${priceFontSize}px Inter, sans-serif`;
    if (ctx.measureText(input.price).width <= maxPriceWidth) break;
    priceFontSize -= 2;
  }

  const priceY = btn.y + btn.height / 2;
  ctx.fillText(input.price, leftX, priceY);
  ctx.restore();

  // 7. Right Column: Product Image Box
  // Reference spec: x=623 to 1103 (width 480), y=100 to 531 (height 431)
  const imgX = 623;
  const imgY = 100;
  const imgW = 480;
  const imgH = 431;

  let loadedImg: Image | null = null;
  if (input.image) {
    const fetched = await fetchSafeImage(input.image);
    loadedImg = await loadImage(fetched.buffer);
  }

  if (loadedImg) {
    drawImageCover(ctx, loadedImg, imgX, imgY, imgW, imgH, 16, 3, "#000000");
  } else {
    // Elegant fallback box
    ctx.save();
    ctx.fillStyle = "#F3F4F6";
    ctx.beginPath();
    ctx.roundRect(imgX, imgY, imgW, imgH, 16);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    ctx.fillStyle = "#9CA3AF";
    ctx.font = "600 20px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Code Share Zone Product", imgX + imgW / 2, imgY + imgH / 2);
    ctx.restore();
  }

  // 8. Favicon C overlay on top-left of image box
  const faviconImg = await getFaviconImage();
  drawFaviconBadge(ctx, faviconImg, imgX, imgY);

  return canvas.toBuffer("image/png");
}
