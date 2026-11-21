// Bounded in-memory sliding-window rate limiter keyed by scope + IP/email

const MAX_BUCKETS = 10000;
const buckets = new Map();

function pruneExpired(now) {
  for (const [key, entry] of buckets.entries()) {
    const active = entry.timestamps.filter((ts) => ts > now - entry.windowMs);
    if (active.length === 0) {
      buckets.delete(key);
    } else {
      entry.timestamps = active;
    }
  }
}

export function checkRateLimit(bucketKey, maxRequests, windowMs, now = Date.now()) {
  if (!bucketKey) return { allowed: true, retryAfterSec: 0 };

  if (buckets.size >= MAX_BUCKETS) {
    pruneExpired(now);
    while (buckets.size >= MAX_BUCKETS) {
      const oldestKey = buckets.keys().next().value;
      if (!oldestKey) break;
      buckets.delete(oldestKey);
    }
  }

  const cutoff = now - windowMs;
  const existing = buckets.get(bucketKey);
  const active = existing ? existing.timestamps.filter((ts) => ts > cutoff) : [];

  if (active.length >= maxRequests) {
    const retryMs = Math.max(1000, active[0] + windowMs - now);
    buckets.set(bucketKey, { timestamps: active, windowMs });
    return {
      allowed: false,
      retryAfterSec: Math.ceil(retryMs / 1000),
    };
  }

  active.push(now);
  buckets.set(bucketKey, { timestamps: active, windowMs });
  return { allowed: true, retryAfterSec: 0 };
}

export function resetRateLimits() {
  buckets.clear();
}
