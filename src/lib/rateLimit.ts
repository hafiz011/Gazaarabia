/**
 * Simple In-Memory Rate Limiter
 * For production, use @upstash/ratelimit with Redis
 */

import { NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
  message?: string; // Custom error message
}

/**
 * Rate limiter middleware
 * Returns true if request is allowed, false if rate limited
 */
export async function rateLimit(
  req: Request,
  options: RateLimitOptions
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (r) => getClientIp(r),
  } = options;

  const key = keyGenerator(req);
  const now = Date.now();

  // Initialize or get existing rate limit data
  if (!store[key] || now > store[key].resetTime) {
    store[key] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  const remaining = maxRequests - store[key].count;
  const allowed = store[key].count < maxRequests;

  if (allowed) {
    store[key].count++;
  }

  return {
    allowed,
    remaining: Math.max(0, remaining - 1),
    resetTime: store[key].resetTime,
  };
}

/**
 * Extract client IP from request
 */
function getClientIp(req: Request): string {
  // Try to get IP from headers (in order of preference)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  // Fallback - this won't work in production without proper proxy setup
  return "unknown";
}

/**
 * Cleanup expired entries from store (run periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const key in store) {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  }
}

// Cleanup every 5 minutes
if (typeof global !== "undefined") {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse(resetTime: number) {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

  return NextResponse.json(
    {
      message: "Too many requests. Please try again later.",
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Reset": String(resetTime),
      },
    }
  );
}
