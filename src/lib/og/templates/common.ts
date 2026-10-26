import path from "path";
import fs from "fs";
import { loadImage, type Image, type SKRSContext2D } from "@napi-rs/canvas";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// Cached Favicon image
let cachedFaviconImage: Image | null = null;

export async function getFaviconImage(): Promise<Image | null> {
  if (cachedFaviconImage) return cachedFaviconImage;

  const localFaviconPath = path.join(process.cwd(), "public/assets/favicon-c.jpg");
  if (fs.existsSync(localFaviconPath)) {
    try {
      cachedFaviconImage = await loadImage(localFaviconPath);
      return cachedFaviconImage;
    } catch (e) {
      console.warn("Could not load local favicon:", e);
    }
  }

  // Fallback to fetch if local file missing
  try {
    const remoteUrl = "https://api.lumi-base.my.id/imgurl/lumi_1792957534396_487fc8f8.jpeg";
    cachedFaviconImage = await loadImage(remoteUrl);
    return cachedFaviconImage;
  } catch (err) {
    console.warn("Could not fetch remote favicon:", err);
    return null;
  }
}

/**
 * Draws the neo-brutalist canvas background and the main center card
 */
export function drawNeoBrutalistBase(
  ctx: SKRSContext2D,
  bgColor: string = "#9700FF"
): void {
  // 1. Full canvas solid background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, OG_WIDTH, OG_HEIGHT);

  // 2. Main Card coordinates: x=60 to 1140 (width=1080), y=60 to 570 (height=510)
  const cardX = 60;
  const cardY = 60;
  const cardW = 1080;
  const cardH = 510;
  const cardRadius = 20;
  const shadowOffset = 10;

  // Solid black offset shadow (no blur)
  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.roundRect(cardX + shadowOffset, cardY + shadowOffset, cardW, cardH, cardRadius);
  ctx.fill();

  // White main card panel
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
  ctx.fill();

  // Thin black card border (3-4px)
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#000000";
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws the "Code Share Zone" black badge in the top-left
 */
export function drawBadge(ctx: SKRSContext2D, x: number = 100, y: number = 100): number {
  const badgeText = "Code Share Zone";
  ctx.save();
  ctx.font = "bold 14px Inter, sans-serif";

  const textWidth = ctx.measureText(badgeText).width;
  const padX = 14;
  const badgeH = 28;
  const badgeW = textWidth + padX * 2;
  const radius = 6;

  // Black badge background
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.roundRect(x, y, badgeW, badgeH, radius);
  ctx.fill();

  // White text
  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, x + padX, y + badgeH / 2);
  ctx.restore();

  return y + badgeH;
}

/**
 * Draws the horizontal divider and domain name
 */
export function drawDividerAndDomain(
  ctx: SKRSContext2D,
  x: number = 100,
  y: number = 380,
  width: number = 490,
  domain: string = "codeshare.zone.id"
): number {
  ctx.save();

  // Light gray divider line
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.stroke();

  // Domain text
  ctx.fillStyle = "#6B7280";
  ctx.font = "600 15px Inter, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText(domain, x, y + 12);
  ctx.restore();

  return y + 36;
}

/**
 * Draws the solid black action button with white text and solid neo-brutal styling
 */
export function drawActionButton(
  ctx: SKRSContext2D,
  text: string,
  rightX: number = 590,
  bottomY: number = 525
): { width: number; height: number; x: number; y: number } {
  ctx.save();
  ctx.font = "bold 16px Inter, sans-serif";

  const textMetrics = ctx.measureText(text);
  const padX = 22;
  const btnH = 46;
  const btnW = Math.max(120, textMetrics.width + padX * 2);
  const btnX = rightX - btnW;
  const btnY = bottomY - btnH;
  const radius = 10;

  // Solid black button
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, radius);
  ctx.fill();

  // White text
  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, btnX + btnW / 2, btnY + btnH / 2);

  ctx.restore();

  return { width: btnW, height: btnH, x: btnX, y: btnY };
}

/**
 * Draws the C Favicon overlay at the top left of the right image box
 */
export function drawFaviconBadge(
  ctx: SKRSContext2D,
  faviconImg: Image | null,
  imgX: number = 623,
  imgY: number = 100
): void {
  if (!faviconImg) return;

  const favSize = 50;
  const favX = imgX + 16;
  const favY = imgY + 16;
  const radius = 12;

  ctx.save();

  // Subtle shadow under favicon
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.roundRect(favX + 2, favY + 2, favSize, favSize, radius);
  ctx.fill();

  // Clip rounded rect for favicon image
  ctx.beginPath();
  ctx.roundRect(favX, favY, favSize, favSize, radius);
  ctx.clip();

  ctx.drawImage(faviconImg, 0, 0, faviconImg.width, faviconImg.height, favX, favY, favSize, favSize);
  ctx.restore();

  // 2.5px solid black border around favicon
  ctx.save();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#000000";
  ctx.beginPath();
  ctx.roundRect(favX, favY, favSize, favSize, radius);
  ctx.stroke();
  ctx.restore();
}
