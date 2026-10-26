import { NextResponse, NextRequest } from "next/server";
import { checkRateLimit, attachRateLimitHeaders, getClientIp } from "./security/rate-limit";

export function createErrorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown,
  extraHeaders?: Record<string, string>
): NextResponse {
  const headers = new Headers({
    "Content-Type": "application/json",
    ...extraHeaders,
  });

  return new NextResponse(
    JSON.stringify({
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    }),
    {
      status,
      headers,
    }
  );
}

export type RateLimitCheck =
  | { exceeded: true; response: NextResponse }
  | { exceeded: false; headers: Headers };

export function handleApiRateLimit(req: NextRequest): RateLimitCheck {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);
  const headers = new Headers();
  attachRateLimitHeaders(headers, rateLimit);

  if (!rateLimit.allowed) {
    return {
      exceeded: true,
      response: createErrorResponse(
        "RATE_LIMIT_EXCEEDED",
        "Too many requests from this IP. Please try again later.",
        429,
        undefined,
        Object.fromEntries(headers.entries())
      ),
    };
  }

  return {
    exceeded: false,
    headers,
  };
}
