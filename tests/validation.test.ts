import { describe, it, expect } from "vitest";
import { productOgSchema, snippetOgSchema, hexColorSchema } from "../src/lib/validation/og-schemas";

describe("Validation Schemas", () => {
  it("validates valid product data", () => {
    const validData = {
      name: "Raiden Ai V19",
      description: "Bot Whatsapp Raiden Ai Memiliki Banyak Fitur, Terdiri dari fitur Ai, Downloader, DLL",
      price: "Rp 45.000",
      image: "https://api.lumi-base.my.id/imgurl/lumi_1785927127089_c63f4979.jpg",
    };
    const res = productOgSchema.safeParse(validData);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.buttonText).toBe("Buy Now");
      expect(res.data.backgroundColor).toBe("#9700FF");
    }
  });

  it("fails when product name is empty or missing", () => {
    const invalidData = {
      name: "",
      description: "Sample description",
      price: "Rp 10.000",
      image: "https://example.com/image.png",
    };
    const res = productOgSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it("fails when product image URL is not HTTPS", () => {
    const httpData = {
      name: "Product Test",
      description: "Sample",
      price: "Rp 10.000",
      image: "http://example.com/insecure.png",
    };
    const res = productOgSchema.safeParse(httpData);
    expect(res.success).toBe(false);
  });

  it("validates snippet data with optional authorImage", () => {
    const snippetWithoutImage = {
      name: "All In One Downloader",
      description: "All in one is....",
      author: "Bayu Official",
    };
    const res = snippetOgSchema.safeParse(snippetWithoutImage);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.buttonText).toBe("Get Snippet");
      expect(res.data.backgroundColor).toBe("#FFC900");
    }
  });

  it("validates product data with Base64 data URL", () => {
    const base64Data = {
      name: "Base64 Product",
      description: "Testing base64 image payload",
      price: "Rp 99.000",
      image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    };
    const res = productOgSchema.safeParse(base64Data);
    expect(res.success).toBe(true);
  });

  it("validates hex color format", () => {
    expect(hexColorSchema.safeParse("#9700FF").success).toBe(true);
    expect(hexColorSchema.safeParse("#FFF").success).toBe(true);
    expect(hexColorSchema.safeParse("red").success).toBe(false);
    expect(hexColorSchema.safeParse("#1234567").success).toBe(false);
  });
});
