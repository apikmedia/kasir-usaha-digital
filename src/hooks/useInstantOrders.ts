
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useInstantData } from './useInstantData';
import type { Order, BusinessType } from '@/types/order';

export const useInstantOrders = (businessType: BusinessType) => {
  const { toast } = useToast();
  
  const cacheKey = `orders_${businessType}`;

  const fetchOrders = async (): Promise<Order[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('business_type', businessType)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pesanan",
        variant: "destructive",
      });
      return [];
    }

    return data || [];
  };

  const { data: orders, refresh, invalidate } = useInstantData({
    cacheKey,
    fetchFn: fetchOrders,
    defaultData: [] as Order[],
    ttl: 15000
  });

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`orders-instant-${businessType}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `business_type=eq.${businessType}`
        },
        () => {
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessType]);

  return {
    orders,
    loading: false,
    refetch: refresh,
    invalidate
  };
};
