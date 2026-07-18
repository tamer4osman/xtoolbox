/**
 * safeFetch: fetch wrapper with per-domain rate limiting and 429 handling.
 *
 * Limits external API abuse by capping requests per domain per time window.
 * Automatically handles HTTP 429 (Too Many Requests) with Retry-After.
 */

const domainRequests = new Map();

const DEFAULT_MAX_REQUESTS = 10;
const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_TIMEOUT_MS = 15_000;

export class RateLimitError extends Error {
  constructor(domain, retryAfterMs) {
    super(
      `Rate limit exceeded for ${domain}. Try again in ${Math.ceil(retryAfterMs / 1000)} seconds.`
    );
    this.name = "RateLimitError";
    this.domain = domain;
    this.retryAfterMs = retryAfterMs;
  }
}

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function pruneTimestamps(timestamps, windowMs) {
  const cutoff = Date.now() - windowMs;
  while (timestamps.length > 0 && timestamps[0] <= cutoff) {
    timestamps.shift();
  }
}

/**
 * Rate-limited fetch wrapper.
 *
 * @param {string | Request} input - URL or Request object
 * @param {RequestInit & { rateLimit?: { maxRequests?: number, windowMs?: number, timeoutMs?: number } }} [options]
 * @returns {Promise<Response>}
 */
export async function safeFetch(input, options = {}) {
  const { rateLimit: rlConfig, signal: userSignal, ...fetchOptions } = options;
  const url = typeof input === "string" ? input : input.url;
  const domain = getDomain(url);

  const maxRequests = rlConfig?.maxRequests ?? DEFAULT_MAX_REQUESTS;
  const windowMs = rlConfig?.windowMs ?? DEFAULT_WINDOW_MS;
  const timeoutMs = rlConfig?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (!domainRequests.has(domain)) {
    domainRequests.set(domain, []);
  }
  const timestamps = domainRequests.get(domain);
  pruneTimestamps(timestamps, windowMs);

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0];
    const retryAfterMs = windowMs - (Date.now() - oldest);
    throw new RateLimitError(domain, retryAfterMs);
  }

  const ac = new AbortController();
  const timeoutId = setTimeout(() => ac.abort(), timeoutMs);

  if (userSignal) {
    if (userSignal.aborted) {
      ac.abort();
    } else {
      userSignal.addEventListener("abort", () => ac.abort(), { once: true });
    }
  }

  timestamps.push(Date.now());

  try {
    const res = await fetch(input, { ...fetchOptions, signal: ac.signal });

    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      const retryMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : windowMs;
      throw new RateLimitError(domain, retryMs);
    }

    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}
