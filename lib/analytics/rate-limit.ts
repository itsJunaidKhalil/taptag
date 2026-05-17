import {
  PROFILE_VIEW_DEDUPE_MS,
  RATE_LIMIT_EVENTS_PER_IP_PER_MINUTE,
} from "./constants";

type WindowEntry = { count: number; resetAt: number };

const ipMinuteWindows = new Map<string, WindowEntry>();
const profileViewDedupe = new Map<string, number>();

function pruneExpired(map: Map<string, WindowEntry>, now: number) {
  if (map.size < 5000) return;
  map.forEach((entry, key) => {
    if (entry.resetAt <= now) map.delete(key);
  });
}

function pruneDedupe(now: number) {
  if (profileViewDedupe.size < 5000) return;
  profileViewDedupe.forEach((expiresAt, key) => {
    if (expiresAt <= now) profileViewDedupe.delete(key);
  });
}

/** In-memory sliding window: events per IP per minute. */
function checkIpMinuteLimitMemory(ip: string): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now();
  pruneExpired(ipMinuteWindows, now);
  const windowMs = 60_000;
  let entry = ipMinuteWindows.get(ip);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    ipMinuteWindows.set(ip, entry);
  }
  if (entry.count >= RATE_LIMIT_EVENTS_PER_IP_PER_MINUTE) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }
  entry.count += 1;
  return { ok: true };
}

function checkProfileViewDedupeMemory(
  ip: string,
  profileId: string,
): { ok: true } | { ok: false } {
  const now = Date.now();
  pruneDedupe(now);
  const key = `${ip}:${profileId}`;
  const expiresAt = profileViewDedupe.get(key);
  if (expiresAt && expiresAt > now) {
    return { ok: false };
  }
  profileViewDedupe.set(key, now + PROFILE_VIEW_DEDUPE_MS);
  return { ok: true };
}

let upstashRatelimit: import("@upstash/ratelimit").Ratelimit | null = null;
let upstashInitFailed = false;

async function getUpstashRatelimit(): Promise<import("@upstash/ratelimit").Ratelimit | null> {
  if (upstashInitFailed) return null;
  if (upstashRatelimit) return upstashRatelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    upstashRatelimit = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(
        RATE_LIMIT_EVENTS_PER_IP_PER_MINUTE,
        "1 m",
      ),
      prefix: "analytics:ip",
    });
    return upstashRatelimit;
  } catch {
    upstashInitFailed = true;
    return null;
  }
}

async function checkIpMinuteLimitUpstash(
  ip: string,
): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }> {
  const rl = await getUpstashRatelimit();
  if (!rl) return checkIpMinuteLimitMemory(ip);
  const { success, reset } = await rl.limit(ip);
  if (success) return { ok: true };
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((reset - Date.now()) / 1000),
  );
  return { ok: false, retryAfterSeconds };
}

async function checkProfileViewDedupeUpstash(
  ip: string,
  profileId: string,
): Promise<{ ok: true } | { ok: false }> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return checkProfileViewDedupeMemory(ip, profileId);
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url, token });
    const key = `analytics:view:${ip}:${profileId}`;
    const set = await redis.set(key, "1", {
      nx: true,
      px: PROFILE_VIEW_DEDUPE_MS,
    });
    if (set === null) return { ok: false };
    return { ok: true };
  } catch {
    return checkProfileViewDedupeMemory(ip, profileId);
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export async function assertAnalyticsRateLimits(
  req: Request,
): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }> {
  const ip = getClientIp(req);
  const minute = await checkIpMinuteLimitUpstash(ip);
  if (!minute.ok) {
    return { ok: false, retryAfterSeconds: minute.retryAfterSeconds };
  }
  return { ok: true };
}

export async function shouldRecordProfileView(
  req: Request,
  profileId: string,
): Promise<boolean> {
  const ip = getClientIp(req);
  const dedupe = await checkProfileViewDedupeUpstash(ip, profileId);
  return dedupe.ok;
}
