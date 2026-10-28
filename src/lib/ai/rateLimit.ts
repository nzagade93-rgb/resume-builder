/**
 * Rate Limiting for AI requests:
 * 10 requests per hour per browser / IP
 */

export const MAX_AI_REQUESTS_PER_HOUR = 10;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// In-memory server rate limit storage
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const serverRateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Server-side IP rate limiter
 */
export function checkServerRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const record = serverRateLimitMap.get(ip);

  // If no record or expired, create fresh record
  if (!record || now >= record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };
    serverRateLimitMap.set(ip, newRecord);
    return {
      allowed: true,
      remaining: MAX_AI_REQUESTS_PER_HOUR - 1,
      resetAt: newRecord.resetAt,
    };
  }

  // If limit reached
  if (record.count >= MAX_AI_REQUESTS_PER_HOUR) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  // Increment usage
  record.count += 1;
  return {
    allowed: true,
    remaining: MAX_AI_REQUESTS_PER_HOUR - record.count,
    resetAt: record.resetAt,
  };
}

const CLIENT_STORAGE_KEY = "resume_builder_ai_rate_limit";

/**
 * Client-side browser rate limit tracker
 */
export function getClientAiUsage(): {
  used: number;
  remaining: number;
  resetMinutes: number;
  canRequest: boolean;
} {
  if (typeof window === "undefined") {
    return { used: 0, remaining: MAX_AI_REQUESTS_PER_HOUR, resetMinutes: 60, canRequest: true };
  }

  try {
    const raw = localStorage.getItem(CLIENT_STORAGE_KEY);
    const now = Date.now();

    if (!raw) {
      return { used: 0, remaining: MAX_AI_REQUESTS_PER_HOUR, resetMinutes: 60, canRequest: true };
    }

    const data: RateLimitRecord = JSON.parse(raw);
    if (now >= data.resetAt) {
      localStorage.removeItem(CLIENT_STORAGE_KEY);
      return { used: 0, remaining: MAX_AI_REQUESTS_PER_HOUR, resetMinutes: 60, canRequest: true };
    }

    const remaining = Math.max(0, MAX_AI_REQUESTS_PER_HOUR - data.count);
    const resetMinutes = Math.max(1, Math.ceil((data.resetAt - now) / 60000));

    return {
      used: data.count,
      remaining,
      resetMinutes,
      canRequest: remaining > 0,
    };
  } catch {
    return { used: 0, remaining: MAX_AI_REQUESTS_PER_HOUR, resetMinutes: 60, canRequest: true };
  }
}

export function recordClientAiUsage(): { remaining: number; resetMinutes: number } {
  if (typeof window === "undefined") {
    return { remaining: MAX_AI_REQUESTS_PER_HOUR - 1, resetMinutes: 60 };
  }

  try {
    const raw = localStorage.getItem(CLIENT_STORAGE_KEY);
    const now = Date.now();

    let record: RateLimitRecord;
    if (!raw) {
      record = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    } else {
      const parsed: RateLimitRecord = JSON.parse(raw);
      if (now >= parsed.resetAt) {
        record = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
      } else {
        record = { count: parsed.count + 1, resetAt: parsed.resetAt };
      }
    }

    localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(record));
    const remaining = Math.max(0, MAX_AI_REQUESTS_PER_HOUR - record.count);
    const resetMinutes = Math.max(1, Math.ceil((record.resetAt - now) / 60000));
    return { remaining, resetMinutes };
  } catch {
    return { remaining: MAX_AI_REQUESTS_PER_HOUR - 1, resetMinutes: 60 };
  }
}
