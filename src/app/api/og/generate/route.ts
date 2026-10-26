import { NextRequest, NextResponse } from "next/server";
import { generateOgSchema, productOgSchema, snippetOgSchema } from "@/lib/validation/og-schemas";
import { renderOgImage } from "@/lib/og/renderer";
import { createErrorResponse, handleApiRateLimit } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const parsedWrapper = generateOgSchema.safeParse(body);
  if (!parsedWrapper.success) {
    const issue = parsedWrapper.error.issues[0];
    return createErrorResponse(
      "INVALID_INPUT",
      issue ? `${issue.path.join(".")}: ${issue.message}` : "Invalid request data",
      400
    );
  }

  const { type, data, responseType } = parsedWrapper.data;

  // Validate specific type data
  if (type === "product") {
    const parsedData = productOgSchema.safeParse(data);
    if (!parsedData.success) {
      const issue = parsedData.error.issues[0];
      return createErrorResponse(
        "INVALID_INPUT",
        issue ? `data.${issue.path.join(".")}: ${issue.message}` : "Invalid product data",
        400,
        parsedData.error.format()
      );
    }

    try {
      const result = await renderOgImage("product", parsedData.data);

      if (responseType === "base64") {
        return NextResponse.json(
          {
            success: true,
            mimeType: "image/png",
            width: result.width,
            height: result.height,
            image: result.buffer.toString("base64"),
          },
          { headers: rateLimit.headers }
        );
      }

      const headers = new Headers(rateLimit.headers);
      headers.set("Content-Type", "image/png");
      headers.set("Cache-Control", "public, max-age=86400");
      return new NextResponse(result.buffer, { status: 200, headers });
    } catch (err: any) {
      const message = err.message || "Failed to render product OG image";
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
  } else if (type === "snippet") {
    const parsedData = snippetOgSchema.safeParse(data);
    if (!parsedData.success) {
      const issue = parsedData.error.issues[0];
      return createErrorResponse(
        "INVALID_INPUT",
        issue ? `data.${issue.path.join(".")}: ${issue.message}` : "Invalid snippet data",
        400,
        parsedData.error.format()
      );
    }

    try {
      const result = await renderOgImage("snippet", parsedData.data);

      if (responseType === "base64") {
        return NextResponse.json(
          {
            success: true,
            mimeType: "image/png",
            width: result.width,
            height: result.height,
            image: result.buffer.toString("base64"),
          },
          { headers: rateLimit.headers }
        );
      }

      const headers = new Headers(rateLimit.headers);
      headers.set("Content-Type", "image/png");
      headers.set("Cache-Control", "public, max-age=86400");
      return new NextResponse(result.buffer, { status: 200, headers });
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

  return createErrorResponse("INVALID_TYPE", "Invalid OG type specified", 400);
}
