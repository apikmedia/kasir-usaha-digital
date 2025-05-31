
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSimpleCache } from './useSimpleCache';
import type { Order, BusinessType } from '@/types/order';

export const useOptimizedOrders = (businessType: BusinessType) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const cache = useSimpleCache();
  const { toast } = useToast();
  
  const cacheKey = `orders_${businessType}`;

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      // Check cache first
      const cached = cache.get<Order[]>(cacheKey);
      if (cached) {
        setOrders(cached);
        if (showLoading) setLoading(false);
        return cached;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setOrders([]);
        if (showLoading) setLoading(false);
        return [];
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('business_type', businessType)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data pesanan",
          variant: "destructive",
        });
        if (showLoading) setLoading(false);
        return [];
      }

      const ordersData = data || [];
      setOrders(ordersData);
      cache.set(cacheKey, ordersData);
      
      if (showLoading) setLoading(false);
      return ordersData;
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      if (showLoading) setLoading(false);
      return [];
    }
  };

  const invalidateAndRefresh = () => {
    cache.invalidate(cacheKey);
    fetchOrders(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [businessType]);

  // Simple real-time updates
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`orders_${businessType}_${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          const record = payload.new || payload.old;
          if (record && record.business_type === businessType) {
            invalidateAndRefresh();
          }
        })
        .subscribe();
    };

    setupRealtime();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [businessType]);

  return {
    orders,
    loading,
    refetch: () => fetchOrders(),
    invalidate: invalidateAndRefresh
  };
};
