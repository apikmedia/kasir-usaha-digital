
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
    invalidateAndRefresh,
    addProductToState,
    updateProductInState,
    removeProductFromState
  } = useProductData();

  const {
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock
  } = useProductOperations({ 
    invalidateAndRefresh, 
    addProductToState, 
    updateProductInState, 
    removeProductFromState 
  });

  useProductRealtime({ invalidateAndRefresh });

  useEffect(() => {
    console.log('useOptimizedProducts: Initial fetch');
    fetchProducts();
  }, []);

  // Debug log when products change
  useEffect(() => {
    console.log('Products state changed:', products.length, products);
  }, [products]);

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
