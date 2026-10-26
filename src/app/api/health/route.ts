import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    service: "Code Share Zone OG Generator",
    status: "ok",
  });
}
