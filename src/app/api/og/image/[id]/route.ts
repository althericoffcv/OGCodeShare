import { NextRequest, NextResponse } from "next/server";
import { storageAdapter } from "@/lib/storage/adapter";
import { createErrorResponse } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id.replace(/\.png$/, "");

  if (!storageAdapter.isConfigured()) {
    return createErrorResponse(
      "STORAGE_NOT_CONFIGURED",
      "Persistent public storage is not configured. Use the direct binary API endpoints (POST /api/og/product or POST /api/og/snippet).",
      501
    );
  }

  const imageBuffer = await storageAdapter.getImage(id);
  if (!imageBuffer) {
    return createErrorResponse(
      "NOT_FOUND",
      "Image not found or temporary cache expired",
      404
    );
  }

  return new NextResponse(imageBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
