const ANON_DAILY_LIMIT = parseInt(
  process.env.NEXT_PUBLIC_ANON_DAILY_LIMIT || "20",
  10
);

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function getResetTimestamp(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  limit: number;
} {
  const now = Date.now();
  let entry = rateLimitStore.get(identifier);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: getResetTimestamp() };
    rateLimitStore.set(identifier, entry);
  }

  const remaining = Math.max(0, ANON_DAILY_LIMIT - entry.count);

  return {
    allowed: entry.count < ANON_DAILY_LIMIT,
    remaining,
    limit: ANON_DAILY_LIMIT,
  };
}

export function incrementUsage(identifier: string): void {
  const now = Date.now();
  let entry = rateLimitStore.get(identifier);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: getResetTimestamp() };
  }

  entry.count++;
  rateLimitStore.set(identifier, entry);
}

// Cleanup old entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now >= entry.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 60 * 60 * 1000);
}
