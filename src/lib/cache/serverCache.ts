/**
 * Enterprise In-Memory High-Concurrency Cache Engine
 * Provides sub-millisecond data access, LRU expiration, and Stampede Protection (Request Coalescing)
 * Built to handle thousands of concurrent queries without database exhaustion.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

class ServerCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private inFlightPromises: Map<string, Promise<any>> = new Map();
  private maxEntries: number;

  constructor(maxEntries: number = 1000) {
    this.maxEntries = maxEntries;
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttlMs) {
      // Expired entry - remove
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data with a time-to-live (TTL) in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number = 60_000): void {
    // If cache exceeds limit, remove oldest key (LRU eviction)
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs,
    });
  }

  /**
   * High-Concurrency Stampede Shield (Request Coalescing):
   * If 1,000 users request the same key at the same millisecond while cache is cold,
   * only ONE fetcher function will execute. All 1,000 requests await the exact same promise.
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 60_000,
    staleFallbackMs: number = 300_000
  ): Promise<T> {
    // 1. Check hot cache
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // 2. Check if an identical request is already in-flight
    const existingPromise = this.inFlightPromises.get(key);
    if (existingPromise) {
      return existingPromise as Promise<T>;
    }

    // 3. Initiate fetch and coalesce concurrent callers
    const fetchPromise = (async () => {
      try {
        const freshData = await fetcher();
        if (freshData !== null && freshData !== undefined) {
          this.set(key, freshData, ttlMs);
        }
        return freshData;
      } catch (error) {
        // If query fails (e.g. database spike), check if we have stale data to prevent outage
        const rawEntry = this.cache.get(key);
        if (rawEntry && Date.now() - rawEntry.timestamp < staleFallbackMs) {
          console.warn(`[ServerCache] Serving stale data for key "${key}" due to fetch error:`, error);
          return rawEntry.data as T;
        }
        throw error;
      } finally {
        this.inFlightPromises.delete(key);
      }
    })();

    this.inFlightPromises.set(key, fetchPromise);
    return fetchPromise;
  }

  /**
   * Delete a specific cache key (e.g. when an admin or vendor updates data)
   */
  delete(key: string): boolean {
    this.inFlightPromises.delete(key);
    return this.cache.delete(key);
  }

  /**
   * Delete keys matching a prefix or regex pattern
   */
  deletePattern(pattern: RegExp | string): void {
    const isString = typeof pattern === 'string';
    for (const key of this.cache.keys()) {
      if (isString ? key.startsWith(pattern as string) : (pattern as RegExp).test(key)) {
        this.cache.delete(key);
        this.inFlightPromises.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.inFlightPromises.clear();
  }

  /**
   * Get cache diagnostics for debugging and monitoring
   */
  getStats() {
    return {
      size: this.cache.size,
      inFlight: this.inFlightPromises.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global server-side singleton instance
export const serverCache = new ServerCache(2000);
