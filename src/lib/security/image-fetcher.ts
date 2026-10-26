import fs from "fs";
import path from "path";
import { validateSafeUrl } from "./ssrf";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const FETCH_TIMEOUT_MS = 7000; // 7 seconds
const MAX_REDIRECTS = 3;

export interface FetchedImage {
  buffer: Buffer;
  contentType: string;
}

/**
 * Validates magic bytes of an image buffer.
 */
export function verifyImageMagicBytes(buffer: Buffer): string {
  if (buffer.length < 12) {
    throw new Error("File too small to be a valid image");
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // GIF: 47 49 46 38 (GIF87a or GIF89a)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "image/gif";
  }

  // WebP: RIFF (bytes 0-3) + WEBP (bytes 8-11)
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  throw new Error("Unsupported image format or invalid magic bytes");
}

/**
 * Securely fetches or decodes an image from:
 * 1. Base64 Data URL (data:image/...;base64,...)
 * 2. Raw Base64 string
 * 3. Local cached assets
 * 4. Remote HTTPS URL (with strict SSRF protection)
 */
export async function fetchSafeImage(imageUrl: string): Promise<FetchedImage> {
  const trimmed = imageUrl.trim();

  // 1. Base64 Data URL (e.g. data:image/png;base64,...)
  if (trimmed.startsWith("data:image/")) {
    const commaIndex = trimmed.indexOf(",");
    if (commaIndex === -1) {
      throw new Error("Invalid base64 data URL: missing data payload comma");
    }
    const base64Data = trimmed.slice(commaIndex + 1);
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > MAX_IMAGE_BYTES) {
      throw new Error(
        `Base64 image size (${Math.round(buffer.length / (1024 * 1024))}MB) exceeds limit of 5MB`
      );
    }
    const contentType = verifyImageMagicBytes(buffer);
    return { buffer, contentType };
  }

  // 2. Raw Base64 string without data prefix
  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    /^[A-Za-z0-9+/=\s]+$/.test(trimmed) &&
    trimmed.length >= 30
  ) {
    try {
      const buffer = Buffer.from(trimmed.replace(/\s+/g, ""), "base64");
      if (buffer.length >= 12 && buffer.length <= MAX_IMAGE_BYTES) {
        const contentType = verifyImageMagicBytes(buffer);
        return { buffer, contentType };
      }
    } catch {
      // Continue to URL checks if base64 decode fails
    }
  }

  // 3. Local bundled asset check for default URLs (fast & offline safe)
  if (trimmed.includes("lumi_1785927127089_c63f4979.jpg")) {
    const localPath = path.join(process.cwd(), "public/assets/sample-product.jpg");
    if (fs.existsSync(localPath)) {
      const buf = fs.readFileSync(localPath);
      return { buffer: buf, contentType: "image/jpeg" };
    }
  }

  if (trimmed.includes("lumi_1792957534396_487fc8f8.jpeg")) {
    const localPath = path.join(process.cwd(), "public/assets/favicon-c.jpg");
    if (fs.existsSync(localPath)) {
      const buf = fs.readFileSync(localPath);
      return { buffer: buf, contentType: "image/jpeg" };
    }
  }

  // 4. Remote URL with SSRF checks
  let currentUrl = trimmed;
  let redirectsCount = 0;

  while (redirectsCount <= MAX_REDIRECTS) {
    // SSRF Check at each step
    await validateSafeUrl(currentUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(currentUrl, {
        method: "GET",
        headers: {
          Accept: "image/png,image/jpeg,image/webp,image/gif,*/*;q=0.8",
          "User-Agent": "CodeShareZone-OG-Bot/1.0",
        },
        signal: controller.signal,
        redirect: "manual",
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("Image download timed out");
      }
      throw new Error(`Failed to request image: ${err.message}`);
    } finally {
      clearTimeout(timeoutId);
    }

    // Handle redirects
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      redirectsCount++;
      if (redirectsCount > MAX_REDIRECTS) {
        throw new Error("Too many redirects while fetching image");
      }
      const location = response.headers.get("location");
      if (!location) {
        throw new Error("Redirect response missing location header");
      }
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (!response.ok) {
      throw new Error(`Remote image returned HTTP status ${response.status}`);
    }

    // Check Content-Length if provided
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_BYTES) {
      throw new Error(
        `Image size exceeds maximum limit of ${MAX_IMAGE_BYTES / (1024 * 1024)}MB`
      );
    }

    // Read response body as arrayBuffer safely
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_IMAGE_BYTES) {
      throw new Error(
        `Downloaded image exceeds maximum limit of ${MAX_IMAGE_BYTES / (1024 * 1024)}MB`
      );
    }

    // Validate magic bytes
    const detectedType = verifyImageMagicBytes(buffer);

    return {
      buffer,
      contentType: detectedType,
    };
  }

  throw new Error("Failed to fetch image due to excessive redirects");
}
