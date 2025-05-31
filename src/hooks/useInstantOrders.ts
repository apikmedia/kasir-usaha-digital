
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
      .limit(100); // Reduced limit for faster loading

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

  const { data: orders, isLoading, refresh, invalidate } = useInstantData({
    cacheKey,
    fetchFn: fetchOrders,
    defaultData: [] as Order[],
    ttl: 60000, // 1 minute cache for faster updates
    autoRefresh: true
  });

  // Enhanced real-time updates with immediate refresh
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`orders-realtime-${businessType}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Order real-time update:', payload.eventType, payload);
            
            const newRecord = payload.new as any;
            const oldRecord = payload.old as any;
            
            // Immediate update for relevant business type
            if ((newRecord && newRecord.business_type === businessType) || 
                (oldRecord && oldRecord.business_type === businessType)) {
              console.log('Triggering immediate order refresh');
              invalidate(); // This now auto-refreshes
            }
          }
        )
        .subscribe((status) => {
          console.log('Orders realtime subscription status:', status);
        });
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
    loading: isLoading,
    refetch: refresh,
    invalidate
  };
};
