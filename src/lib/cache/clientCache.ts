/**
 * Client-Side SWR & Persistent Snapshot Cache
 * Enables 0ms instant UI paints and high-concurrency client deduplication.
 */

interface ClientCacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryStore = new Map<string, ClientCacheEntry<any>>();
const inFlightPromises = new Map<string, Promise<any>>();

const STORAGE_PREFIX = 'putu_cache_';

export const clientCache = {
  /**
   * Get cached data synchronously (Memory first, then LocalStorage)
   */
  get<T>(key: string): T | null {
    // 1. Check memory store
    const mem = memoryStore.get(key);
    if (mem) {
      return mem.data as T;
    }

    // 2. Check local storage for persistent snapshot
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(STORAGE_PREFIX + key);
        if (item) {
          const parsed = JSON.parse(item) as ClientCacheEntry<T>;
          memoryStore.set(key, parsed);
          return parsed.data;
        }
      } catch (e) {
        // LocalStorage read error or quota issue - fallback safely
      }
    }

    return null;
  },

  /**
   * Set cached data into both memory and persistent storage
   */
  set<T>(key: string, data: T): void {
    const entry: ClientCacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };

    memoryStore.set(key, entry);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
      } catch (e) {
        // Storage limit protection
      }
    }
  },

  /**
   * Deduplicate in-flight fetch requests across React components
   */
  async dedupeFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const existing = inFlightPromises.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = (async () => {
      try {
        const result = await fetcher();
        if (result !== null && result !== undefined) {
          this.set(key, result);
        }
        return result;
      } finally {
        inFlightPromises.delete(key);
      }
    })();

    inFlightPromises.set(key, promise);
    return promise;
  },

  /**
   * Invalidate specific key or prefix
   */
  invalidate(key: string): void {
    memoryStore.delete(key);
    inFlightPromises.delete(key);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_PREFIX + key);
      } catch (e) {}
    }
  },

  /**
   * Invalidate all matching keys
   */
  invalidatePattern(prefix: string): void {
    for (const k of memoryStore.keys()) {
      if (k.startsWith(prefix)) {
        memoryStore.delete(k);
        inFlightPromises.delete(k);
      }
    }
    if (typeof window !== 'undefined') {
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX + prefix)) {
            localStorage.removeItem(k);
          }
        }
      } catch (e) {}
    }
  },
};
