import { NextRequest } from "next/server";
import { isPrivateIP } from "./ssrf";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateLimitRecord>();

// Cleanup stale records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipMap.entries()) {
    if (record.resetAt <= now) {
      ipMap.delete(key);
    }
  }
}, 5 * 60 * 1000).unref?.();

/**
 * Safely extracts client IP address from NextRequest
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    // Find the first valid non-private IP, or fallback to the first
    for (const ip of ips) {
      if (ip && !isPrivateIP(ip)) {
        return ip;
      }
    }
    if (ips[0]) return ips[0];
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return req.ip || "127.0.0.1";
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * In-memory sliding window rate limiter
 * Default: 60 requests per 60 seconds
 */
export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const record = ipMap.get(key);

  if (!record || record.resetAt <= now) {
    ipMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const reset = Math.ceil(record.resetAt / 1000);

  if (record.count > limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      reset,
    };
  }

  return {
    allowed: true,
    limit,
    remaining,
    reset,
  };
}

/**
 * Attach standard rate limit headers to a Response
 */
export function attachRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set("X-RateLimit-Limit", result.limit.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", result.reset.toString());
}
