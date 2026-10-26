import { describe, it, expect } from "vitest";
import { isPrivateIPv4, isPrivateIPv6, isPrivateIP, validateSafeUrl } from "../src/lib/security/ssrf";
import { verifyImageMagicBytes } from "../src/lib/security/image-fetcher";
import { checkRateLimit } from "../src/lib/security/rate-limit";

describe("Security & SSRF Protection", () => {
  it("detects private IPv4 addresses", () => {
    expect(isPrivateIPv4("127.0.0.1")).toBe(true);
    expect(isPrivateIPv4("10.0.0.5")).toBe(true);
    expect(isPrivateIPv4("172.16.0.1")).toBe(true);
    expect(isPrivateIPv4("172.31.255.255")).toBe(true);
    expect(isPrivateIPv4("192.168.1.1")).toBe(true);
    expect(isPrivateIPv4("169.254.169.254")).toBe(true);
    expect(isPrivateIPv4("0.0.0.0")).toBe(true);
    expect(isPrivateIPv4("8.8.8.8")).toBe(false);
    expect(isPrivateIPv4("1.1.1.1")).toBe(false);
  });

  it("detects private IPv6 addresses", () => {
    expect(isPrivateIPv6("::1")).toBe(true);
    expect(isPrivateIPv6("fc00::1")).toBe(true);
    expect(isPrivateIPv6("fe80::1")).toBe(true);
    expect(isPrivateIPv6("::ffff:192.168.1.1")).toBe(true);
    expect(isPrivateIP("::1")).toBe(true);
  });

  it("rejects non-HTTPS URLs", async () => {
    await expect(validateSafeUrl("http://example.com/image.png")).rejects.toThrow(
      "Only HTTPS URLs are permitted"
    );
    await expect(validateSafeUrl("ftp://example.com/image.png")).rejects.toThrow(
      "Only HTTPS URLs are permitted"
    );
    await expect(validateSafeUrl("file:///etc/passwd")).rejects.toThrow(
      "Only HTTPS URLs are permitted"
    );
  });

  it("blocks localhost and metadata hostnames", async () => {
    await expect(validateSafeUrl("https://localhost/image.png")).rejects.toThrow();
    await expect(validateSafeUrl("https://127.0.0.1/image.png")).rejects.toThrow();
    await expect(validateSafeUrl("https://169.254.169.254/latest/meta-data/")).rejects.toThrow();
  });

  it("verifies valid and invalid magic bytes", () => {
    // Valid PNG: 89 50 4E 47 0D 0A 1A 0A
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    expect(verifyImageMagicBytes(pngBuffer)).toBe("image/png");

    // Valid JPEG: FF D8 FF
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(verifyImageMagicBytes(jpegBuffer)).toBe("image/jpeg");

    // Invalid file (e.g. HTML/SVG script)
    const scriptBuffer = Buffer.from("<svg onload=alert(1)>");
    expect(() => verifyImageMagicBytes(scriptBuffer)).toThrow("Unsupported image format");
  });

  it("enforces rate limits per key", () => {
    const testIp = `test-client-${Date.now()}`;
    const limit = 5;

    for (let i = 0; i < limit; i++) {
      const result = checkRateLimit(testIp, limit, 10000);
      expect(result.allowed).toBe(true);
    }

    const exceededResult = checkRateLimit(testIp, limit, 10000);
    expect(exceededResult.allowed).toBe(false);
    expect(exceededResult.remaining).toBe(0);
  });
});
