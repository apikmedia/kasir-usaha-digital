
import { useState, useRef } from 'react';
import type { Customer, BusinessType } from '@/types/customer';

interface CacheEntry {
  data: Customer[];
  timestamp: number;
  businessType?: BusinessType;
}

const CACHE_DURATION = 30000; // 30 seconds

export const useCustomerCache = () => {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  
  const getCacheKey = (businessType?: BusinessType) => {
    return businessType ? `customers_${businessType}` : 'customers_all';
  };

  const getCachedData = (businessType?: BusinessType): Customer[] | null => {
    const key = getCacheKey(businessType);
    const cached = cacheRef.current.get(key);
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return cached.data;
  };

  const setCachedData = (data: Customer[], businessType?: BusinessType) => {
    const key = getCacheKey(businessType);
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      businessType
    });
  };

  const invalidateCache = (businessType?: BusinessType) => {
    if (businessType) {
      const key = getCacheKey(businessType);
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  };

  return {
    getCachedData,
    setCachedData,
    invalidateCache
  };
};
