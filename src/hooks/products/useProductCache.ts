
import { useSimpleCache } from '../useSimpleCache';
import type { Product } from './types';

export const useProductCache = () => {
  const cache = useSimpleCache();
  const cacheKey = 'products_warung';

  return {
    get: () => cache.get<Product[]>(cacheKey),
    set: (products: Product[]) => cache.set(cacheKey, products),
    invalidate: () => cache.invalidate(cacheKey),
    cacheKey
  };
};
