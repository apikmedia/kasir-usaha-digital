
import { useOptimizedQuery } from './useOptimizedQuery';
import { useQueryClient } from '@tanstack/react-query';
import type { Order, BusinessType } from '@/types/order';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedOrders = (businessType: BusinessType, options?: {
  dateRange?: { from: Date; to: Date };
  status?: string;
  limit?: number;
}) => {
  const queryClient = useQueryClient();
  
  // Build filters based on options
  const filters: Record<string, any> = {
    business_type: businessType
  };

  if (options?.status) {
    filters.status = options.status;
  }

  const queryConfig = {
    queryKey: ['orders', businessType, options?.status, options?.dateRange],
    table: 'orders',
    select: 'id, order_number, business_type, status, total_amount, payment_method, payment_status, notes, customer_id, created_at, updated_at, finished_at',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    pageSize: options?.limit || 50,
    businessType
  };

  const {
    data: orders,
    isLoading,
    isError,
    error,
    refetch,
    invalidate,
    prefetchNext,
    hasMore
  } = useOptimizedQuery<Order>(queryConfig);

  // Optimized real-time subscription
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`orders_optimized_${businessType}_${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id} AND business_type=eq.${businessType}`
        }, (payload) => {
          console.log('Order real-time update:', payload.eventType);
          
          // Throttled invalidation
          setTimeout(() => {
            queryClient.invalidateQueries({ 
              queryKey: ['orders', businessType] 
            });
          }, 100);
        })
        .subscribe();
    };

    setupRealtime();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [businessType, queryClient]);

  return {
    orders,
    loading: isLoading,
    error: isError ? error : null,
    refetch,
    invalidate,
    hasMore,
    prefetchNext
  };
};
