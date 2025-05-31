
import { useSimpleCache } from '../useSimpleCache';
import type { Product } from './types';

export const useProductCache = () => {
  const cache = useSimpleCache();
  const cacheKey = 'products_warung';

  return {
    get: () => {
      const cached = cache.get<Product[]>(cacheKey);
      console.log('Getting cached products:', cached?.length || 0);
      return cached;
    },
    set: (products: Product[]) => {
      console.log('Setting cached products:', products.length);
      cache.set(cacheKey, products);
    },
    invalidate: () => {
      console.log('Invalidating products cache');
      cache.invalidate(cacheKey);
    },
    cacheKey
  };
};
