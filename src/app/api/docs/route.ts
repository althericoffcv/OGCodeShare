import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // If request asks for JSON, return structured API doc
  const accept = req.headers.get("accept") || "";
  if (accept.includes("application/json")) {
    return NextResponse.json({
      name: "Code Share Zone OG Image Generator API",
      version: "1.0.0",
      description: "High-fidelity Neo-Brutalist Open Graph image generator API for products and code snippets",
      endpoints: [
        {
          path: "/api/og/product",
          method: "POST",
          description: "Generates a 1200x630 PNG Open Graph image for products",
          body: {
            required: ["name", "description", "price", "image"],
            optional: ["buttonText", "backgroundColor", "imageFit"],
          },
          responses: {
            200: "image/png (1200x630)",
            400: "Invalid input schema",
            422: "Restricted or invalid image URL",
            429: "Rate limit exceeded",
          },
        },
        {
          path: "/api/og/snippet",
          method: "POST",
          description: "Generates a 1200x630 PNG Open Graph image for code snippets",
          body: {
            required: ["name", "description", "author"],
            optional: ["authorImage", "buttonText", "backgroundColor", "imageFit"],
          },
          responses: {
            200: "image/png (1200x630)",
            400: "Invalid input schema",
            422: "Restricted or invalid image URL",
            429: "Rate limit exceeded",
          },
        },
        {
          path: "/api/og/generate",
          method: "POST",
          description: "Universal endpoint supporting binary PNG and Base64 JSON responses",
          body: {
            required: ["type", "data"],
            optional: ["responseType"],
          },
        },
        {
          path: "/api/health",
          method: "GET",
          description: "Health check endpoint",
        },
      ],
    });
  }

  // Otherwise redirect to full documentation page
  const docsUrl = new URL("/docs", req.url);
  return NextResponse.redirect(docsUrl);
}
