
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

  set<T>(key: string, data: T, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
    console.log(`Cached data for ${key}, expires in ${ttl/1000}s`);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      console.log(`Cache expired for ${key}`);
      return null;
    }
    
    console.log(`Cache hit for ${key}`);
    return entry.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      console.log('Cache cleared completely');
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        console.log(`Cache invalidated for ${key}`);
      }
    }
  }

  // Check if data is fresh (within 30 seconds)
  isFresh(key: string, maxAge: number = 30000): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return (Date.now() - entry.timestamp) < maxAge;
  }

  // Aggressive preloading
  preload<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): void {
    if (this.get(key)) return; // Already cached
    
    fetchFn().then(data => {
      this.set(key, data, ttl);
      console.log(`Preloaded data for ${key}`);
    }).catch(error => {
      console.warn(`Failed to preload ${key}:`, error);
    });
  }
}

export const useGlobalCache = () => {
  const cacheRef = useRef(GlobalCacheManager.getInstance());
  return cacheRef.current;
};
