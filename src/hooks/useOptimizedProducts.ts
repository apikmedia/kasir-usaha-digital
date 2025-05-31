
import { useEffect } from 'react';
import { useProductData } from './products/useProductData';
import { useProductOperations } from './products/useProductOperations';
import { useProductRealtime } from './products/useProductRealtime';

export type { Product } from './products/types';

export const useOptimizedProducts = () => {
  const {
    products,
    loading,
    fetchProducts,
    invalidateAndRefresh
  } = useProductData();

  const {
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock
  } = useProductOperations({ invalidateAndRefresh });

  useProductRealtime({ invalidateAndRefresh });

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    refetch: () => fetchProducts(),
    invalidate: invalidateAndRefresh
  };
};
