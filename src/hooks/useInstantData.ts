
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
  ttl = 30000,
  autoRefresh = true
}: InstantDataOptions<T>) => {
  const cache = useGlobalCache();
  const [data, setData] = useState<T>(() => {
    const cached = cache.get<T>(cacheKey);
    return cached || defaultData;
  });
  
  const isInitialMount = useRef(true);
  const refreshTimer = useRef<NodeJS.Timeout>();

  const refresh = async (silent = false) => {
    try {
      const freshData = await fetchFn();
      cache.set(cacheKey, freshData, ttl);
      setData(freshData);
    } catch (error) {
      console.error(`Error refreshing ${cacheKey}:`, error);
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Check if we have cached data
      const cached = cache.get<T>(cacheKey);
      if (cached) {
        setData(cached);
        
        // Silently refresh in background
        if (autoRefresh) {
          refresh(true);
        }
      } else {
        // No cached data, fetch immediately
        refresh();
      }
      
      if (autoRefresh) {
        refreshTimer.current = setInterval(() => refresh(true), ttl);
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
    invalidate: () => cache.invalidate(cacheKey)
  };
};
