
import { useState, useEffect, useRef } from 'react';
import { useGlobalCache } from './cache/useGlobalCache';

interface InstantDataOptions<T> {
  cacheKey: string;
  fetchFn: () => Promise<T>;
  defaultData: T;
  ttl?: number;
  autoRefresh?: boolean;
}

export const useInstantData = <T>({
  cacheKey,
  fetchFn,
  defaultData,
  ttl = 15000, // Reduced default TTL
  autoRefresh = true
}: InstantDataOptions<T>) => {
  const cache = useGlobalCache();
  const [data, setData] = useState<T>(() => {
    const cached = cache.get<T>(cacheKey);
    return cached || defaultData;
  });
  
  const isInitialMount = useRef(true);
  const refreshTimer = useRef<NodeJS.Timeout>();
  const isFetching = useRef(false);

  const refresh = async (silent = false) => {
    if (isFetching.current) return;
    
    try {
      isFetching.current = true;
      const freshData = await fetchFn();
      cache.set(cacheKey, freshData, ttl);
      setData(freshData);
    } catch (error) {
      console.error(`Error refreshing ${cacheKey}:`, error);
    } finally {
      isFetching.current = false;
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Check cache first
      const cached = cache.get<T>(cacheKey);
      if (cached) {
        setData(cached);
        // Immediate background refresh for fresh data
        if (autoRefresh) {
          setTimeout(() => refresh(true), 100);
        }
      } else {
        // No cache, fetch immediately
        refresh();
      }
      
      // Set up auto-refresh with shorter interval
      if (autoRefresh) {
        refreshTimer.current = setInterval(() => refresh(true), ttl * 0.8);
      }
    }

    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [cacheKey]);

  return {
    data,
    refresh: () => refresh(false),
    invalidate: () => {
      cache.invalidate(cacheKey);
      refresh();
    }
  };
};
