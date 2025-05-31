
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
  ttl = 300000, // 5 minutes - much longer cache
  autoRefresh = false // Disable auto refresh by default
}: InstantDataOptions<T>) => {
  const cache = useGlobalCache();
  const [data, setData] = useState<T>(() => {
    const cached = cache.get<T>(cacheKey);
    return cached || defaultData;
  });
  
  const isInitialMount = useRef(true);
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
        console.log(`Using cached data for ${cacheKey}`);
        return; // Don't fetch if we have fresh cache
      } else {
        // No cache, fetch immediately
        console.log(`Fetching fresh data for ${cacheKey}`);
        refresh();
      }
    }
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
