import { NextRequest, NextResponse } from "next/server";
import { snippetOgSchema } from "@/lib/validation/og-schemas";
import { renderOgImage } from "@/lib/og/renderer";
import { createErrorResponse, handleApiRateLimit } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function processSnippetRequest(data: unknown, rateLimitHeaders: Headers) {
  const parsed = snippetOgSchema.safeParse(data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return createErrorResponse(
      "INVALID_INPUT",
      issue ? `${issue.path.join(".")}: ${issue.message}` : "Invalid request data",
      400,
      parsed.error.format()
    );
  }

  try {
    const result = await renderOgImage("snippet", parsed.data);

    const headers = new Headers(rateLimitHeaders);
    headers.set("Content-Type", "image/png");
    headers.set("Cache-Control", "public, max-age=86400, s-maxage=86400");
    headers.set("Content-Length", result.buffer.length.toString());

    return new NextResponse(result.buffer, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    const message = err.message || "Failed to render snippet OG image";
    const isClientFault =
      message.includes("restricted") ||
      message.includes("forbidden") ||
      message.includes("SSRF") ||
      message.includes("format") ||
      message.includes("magic bytes") ||
      message.includes("size exceeds") ||
      message.includes("timed out") ||
      message.includes("DNS resolution");
    const status = isClientFault ? 422 : 500;
    const code = isClientFault ? "INVALID_IMAGE" : "RENDERING_ERROR";
    return createErrorResponse(code, message, status);
  }
}

/**
 * POST /api/og/snippet
 * Recommended for full JSON payload and Base64 authorImage
 */
export async function POST(req: NextRequest) {
  const rateLimit = handleApiRateLimit(req);
  if (rateLimit.exceeded) {
    return rateLimit.response;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse("INVALID_JSON", "Invalid JSON payload in request body", 400);
  }

  return processSnippetRequest(body, rateLimit.headers);
}

/**
 * GET /api/og/snippet
 * Convenient for direct <meta property="og:image"> and <img> embed links
 */
export async function GET(req: NextRequest) {
  const rateLimit = handleApiRateLimit(req);
  if (rateLimit.exceeded) {
    return rateLimit.response;
  }

  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name") || "";
  const description = searchParams.get("description") || "";
  const author = searchParams.get("author") || "";
  const authorImage = searchParams.get("authorImage") || undefined;
  const buttonText = searchParams.get("buttonText") || undefined;
  const backgroundColor = searchParams.get("backgroundColor") || undefined;
  const imageFit = (searchParams.get("imageFit") as "cover" | "contain") || undefined;

  const data = {
    name,
    description,
    author,
    ...(authorImage ? { authorImage } : {}),
    ...(buttonText ? { buttonText } : {}),
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(imageFit ? { imageFit } : {}),
  };

  return processSnippetRequest(data, rateLimit.headers);
}
