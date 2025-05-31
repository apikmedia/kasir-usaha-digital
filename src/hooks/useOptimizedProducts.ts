
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSimpleCache } from './useSimpleCache';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  sku?: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useOptimizedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const cache = useSimpleCache();
  const { toast } = useToast();
  
  const cacheKey = 'products_warung';

  const fetchProducts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      // Check cache first
      const cached = cache.get<Product[]>(cacheKey);
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
      cache.set(cacheKey, productsData);
      
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
    cache.invalidate(cacheKey);
    fetchProducts(false);
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Produk berhasil ditambahkan",
      });

      invalidateAndRefresh();
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan produk",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Produk berhasil diperbarui",
      });

      invalidateAndRefresh();
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui produk",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Produk berhasil dihapus",
      });

      invalidateAndRefresh();
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus produk",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    return updateProduct(id, { stock: newStock });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Enhanced real-time updates
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`products_realtime_${user.id}_${Date.now()}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('Product real-time update:', payload.eventType, payload);
          // Immediate refresh for all product changes
          invalidateAndRefresh();
        })
        .subscribe((status) => {
          console.log('Products realtime subscription status:', status);
        });
    };

    setupRealtime();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
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
