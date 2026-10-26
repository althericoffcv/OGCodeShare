import { describe, it, expect } from "vitest";
import { renderOgImage } from "../src/lib/og/renderer";

function getPngDimensions(buffer: Buffer): { width: number; height: number } {
  // In standard PNG: IHDR chunk starts at byte 12, width is 4 bytes at offset 16, height 4 bytes at offset 20 (big endian)
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

describe("OG Image Rendering Engine", () => {
  it("renders Product OG image with correct PNG signature and 1200x630 dimensions", async () => {
    const res = await renderOgImage("product", {
      name: "Raiden Ai V19",
      description: "Bot Whatsapp Raiden Ai Memiliki Banyak Fitur, Terdiri dari fitur Ai, Downloader, DLL",
      price: "Rp 45.000",
      image: "https://api.lumi-base.my.id/imgurl/lumi_1785927127089_c63f4979.jpg",
      buttonText: "Buy Now",
      backgroundColor: "#9700FF",
    });

    expect(res.buffer).toBeInstanceOf(Buffer);
    expect(res.buffer.length).toBeGreaterThan(1000);

    // Verify PNG signature: 89 50 4E 47 0D 0A 1A 0A
    expect(res.buffer[0]).toBe(0x89);
    expect(res.buffer[1]).toBe(0x50);
    expect(res.buffer[2]).toBe(0x4e);
    expect(res.buffer[3]).toBe(0x47);
    expect(res.buffer[4]).toBe(0x0d);
    expect(res.buffer[5]).toBe(0x0a);
    expect(res.buffer[6]).toBe(0x1a);
    expect(res.buffer[7]).toBe(0x0a);

    // Verify dimensions
    const dims = getPngDimensions(res.buffer);
    expect(dims.width).toBe(1200);
    expect(dims.height).toBe(630);
  });

  it("renders Snippet OG image with fallback when authorImage is omitted", async () => {
    const res = await renderOgImage("snippet", {
      name: "All In One Downloader",
      description: "All in one is....",
      author: "Bayu Official",
      buttonText: "Get Snippet",
      backgroundColor: "#FFC900",
    });

    expect(res.buffer).toBeInstanceOf(Buffer);
    expect(res.buffer.length).toBeGreaterThan(1000);

    const dims = getPngDimensions(res.buffer);
    expect(dims.width).toBe(1200);
    expect(dims.height).toBe(630);
  });

  it("handles extremely long title, long description, long price, and long author without crashing", async () => {
    const longProductRes = await renderOgImage("product", {
      name: "Super Ultra Extremely Long Extended Product Name That Should Gracefully Auto Scale and Never Overflow the Layout Columns",
      description: "This is a very comprehensive, long-winded description explaining every single detail of the product feature set to test multi-line text wrapping, auto-calculated line height, and controlled ellipsis clipping so that the divider line is never collided with.",
      price: "Rp 999.999.999.999 / year with special promo discount",
      image: "https://api.lumi-base.my.id/imgurl/lumi_1785927127089_c63f4979.jpg",
    });

    expect(longProductRes.buffer).toBeInstanceOf(Buffer);
    const productDims = getPngDimensions(longProductRes.buffer);
    expect(productDims.width).toBe(1200);
    expect(productDims.height).toBe(630);

    const longSnippetRes = await renderOgImage("snippet", {
      name: "Very Long Snippet Algorithm Title For Binary Search Tree Traversal with Memoization",
      description: "Detailed description of how tree nodes are visited recursively with memoization and dynamic programming approaches.",
      author: "Senior Software Engineer Bayu Official Long Name",
    });

    expect(longSnippetRes.buffer).toBeInstanceOf(Buffer);
    const snippetDims = getPngDimensions(longSnippetRes.buffer);
    expect(snippetDims.width).toBe(1200);
    expect(snippetDims.height).toBe(630);
  });

  it("renders Product OG image using inline Base64 data URL image", async () => {
    // 1x1 valid PNG base64
    const base64Png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const res = await renderOgImage("product", {
      name: "Product With Base64 Image",
      description: "Direct base64 image data rendering test",
      price: "Rp 50.000",
      image: base64Png,
      buttonText: "Buy Now",
    });

    expect(res.buffer).toBeInstanceOf(Buffer);
    expect(res.buffer[0]).toBe(0x89);
    const dims = getPngDimensions(res.buffer);
    expect(dims.width).toBe(1200);
    expect(dims.height).toBe(630);
  });
});
