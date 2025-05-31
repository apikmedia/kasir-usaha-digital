
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
  ttl = 60000, // Reduced to 1 minute for faster updates
  autoRefresh = true // Enable auto refresh for real-time feel
}: InstantDataOptions<T>) => {
  const cache = useGlobalCache();
  const [data, setData] = useState<T>(() => {
    const cached = cache.get<T>(cacheKey);
    return cached || defaultData;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const isInitialMount = useRef(true);
  const isFetching = useRef(false);

  const refresh = async (silent = false) => {
    if (isFetching.current) return;
    
    try {
      isFetching.current = true;
      if (!silent) setIsLoading(true);
      
      const freshData = await fetchFn();
      cache.set(cacheKey, freshData, ttl);
      setData(freshData);
      console.log(`Data refreshed for ${cacheKey}`);
    } catch (error) {
      console.error(`Error refreshing ${cacheKey}:`, error);
    } finally {
      isFetching.current = false;
      if (!silent) setIsLoading(false);
    }
  };

  // Instant invalidate and refresh
  const invalidateAndRefresh = async () => {
    cache.invalidate(cacheKey);
    await refresh(false); // Show loading during refresh
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Check cache first, but always fetch fresh data
      const cached = cache.get<T>(cacheKey);
      if (cached && cache.isFresh(cacheKey, 10000)) { // Only use cache if very fresh (10 seconds)
        setData(cached);
        console.log(`Using fresh cached data for ${cacheKey}`);
      } else {
        // Fetch immediately for responsive experience
        console.log(`Fetching fresh data for ${cacheKey}`);
        refresh(false);
      }
    }
  }, [cacheKey]);

  return {
    data,
    isLoading,
    refresh: () => refresh(false),
    invalidate: invalidateAndRefresh // Changed to auto-refresh after invalidation
  };
};
