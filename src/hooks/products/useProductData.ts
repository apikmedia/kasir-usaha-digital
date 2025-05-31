
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProductCache } from './useProductCache';
import type { Product } from './types';

export const useProductData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const cache = useProductCache();
  const { toast } = useToast();

  const fetchProducts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProducts([]);
        if (showLoading) setLoading(false);
        return [];
      }

      console.log('Fetching products for user:', user.id);

      // Always fetch fresh data from database
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false }); // Show newest first

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data produk",
          variant: "destructive",
        });
        if (showLoading) setLoading(false);
        return [];
      }

      const productsData = data || [];
      console.log('Fetched products:', productsData.length, productsData);
      
      // Update state immediately
      setProducts(productsData);
      
      // Update cache
      cache.set(productsData);
      
      if (showLoading) setLoading(false);
      return productsData;
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      if (showLoading) setLoading(false);
      return [];
    }
  };

  const invalidateAndRefresh = async () => {
    console.log('Invalidating products cache and refreshing');
    cache.invalidate();
    
    // Force immediate refresh
    const freshData = await fetchProducts(false);
    console.log('Fresh data after invalidate:', freshData);
    return freshData;
  };

  const addProductToState = (newProduct: Product) => {
    console.log('Adding product to state:', newProduct);
    setProducts(prev => {
      const updated = [newProduct, ...prev];
      console.log('Updated products state:', updated);
      cache.set(updated);
      return updated;
    });
  };

  const updateProductInState = (updatedProduct: Product) => {
    console.log('Updating product in state:', updatedProduct);
    setProducts(prev => {
      const updated = prev.map(p => p.id === updatedProduct.id ? updatedProduct : p);
      console.log('Updated products state after edit:', updated);
      cache.set(updated);
      return updated;
    });
  };

  const removeProductFromState = (productId: string) => {
    console.log('Removing product from state:', productId);
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      console.log('Updated products state after delete:', updated);
      cache.set(updated);
      return updated;
    });
  };

  return {
    products,
    loading,
    fetchProducts,
    invalidateAndRefresh,
    setProducts,
    addProductToState,
    updateProductInState,
    removeProductFromState
  };
};
