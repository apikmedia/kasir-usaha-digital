
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

      // Check cache first
      const cached = cache.get();
      if (cached) {
        setProducts(cached);
        if (showLoading) setLoading(false);
        return cached;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProducts([]);
        if (showLoading) setLoading(false);
        return [];
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name');

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
      setProducts(productsData);
      cache.set(productsData);
      
      if (showLoading) setLoading(false);
      return productsData;
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      if (showLoading) setLoading(false);
      return [];
    }
  };

  const invalidateAndRefresh = () => {
    console.log('Invalidating products cache and refreshing');
    cache.invalidate();
    fetchProducts(false);
  };

  return {
    products,
    loading,
    fetchProducts,
    invalidateAndRefresh,
    setProducts
  };
};
