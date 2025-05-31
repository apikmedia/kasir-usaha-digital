
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
      .limit(200); // Increased limit for better UX

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
    ttl: 300000, // 5 minutes cache
    autoRefresh: false
  });

  // Real-time updates - only invalidate cache
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`orders-instant-${businessType}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Order real-time update:', payload.eventType);
            // Only invalidate cache for orders that match our business type
            if (payload.new?.business_type === businessType || 
                payload.old?.business_type === businessType) {
              invalidate();
            }
          }
        )
        .subscribe();
    };

    setupRealtime();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [businessType, invalidate]);

  return {
    orders,
    loading: false,
    refetch: refresh,
    invalidate
  };
};
