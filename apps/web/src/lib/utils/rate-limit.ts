interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new Map<string, number[]>();

  return {
    check: (limit: number, token: string) => {
      const now = Date.now();
      const intervalMs = options.interval;
      
      let tokenTimestamps = tokenCache.get(token) || [];
      tokenTimestamps = tokenTimestamps.filter((timestamp) => now - timestamp < intervalMs);

      if (tokenTimestamps.length >= limit) {
        throw new Error("Rate limit exceeded");
      }

      tokenTimestamps.push(now);
      tokenCache.set(token, tokenTimestamps);

      if (tokenCache.size > options.uniqueTokenPerInterval) {
        const firstKey = tokenCache.keys().next().value;
        if (firstKey) {
          tokenCache.delete(firstKey);
        }
      }
    },
  };
}
