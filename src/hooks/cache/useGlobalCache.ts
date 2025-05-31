
import { useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class GlobalCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private static instance: GlobalCacheManager;

  static getInstance(): GlobalCacheManager {
    if (!GlobalCacheManager.instance) {
      GlobalCacheManager.instance = new GlobalCacheManager();
    }
    return GlobalCacheManager.instance;
  }

  set<T>(key: string, data: T, ttl: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  prefetch<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) return Promise.resolve(cached);
    
    return fetchFn().then(data => {
      this.set(key, data, ttl);
      return data;
    });
  }

  // Add method to check if data is fresh
  isFresh(key: string, maxAge: number = 5000): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return (Date.now() - entry.timestamp) < maxAge;
  }

  // Preemptively refresh data that's about to expire
  scheduleRefresh<T>(key: string, fetchFn: () => Promise<T>, ttl: number): void {
    const refreshTime = ttl * 0.8; // Refresh at 80% of TTL
    setTimeout(async () => {
      try {
        const data = await fetchFn();
        this.set(key, data, ttl);
      } catch (error) {
        console.warn(`Failed to preemptively refresh ${key}:`, error);
      }
    }, refreshTime);
  }
}

export const useGlobalCache = () => {
  const cacheRef = useRef(GlobalCacheManager.getInstance());
  return cacheRef.current;
};
