
import { useOptimizedQuery } from './useOptimizedQuery';
import { useOrderOperations } from './useOrderOperations';
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
  const { createOrder: createOrderOp, updateOrderStatus } = useOrderOperations();
  
  // Build filters based on options
  const filters: Record<string, any> = {
    business_type: businessType
  };

  if (options?.status) {
    filters.status = options.status;
  }

  // Fix queryKey to be all strings
  const dateRangeKey = options?.dateRange ? 
    `${options.dateRange.from.toISOString()}_${options.dateRange.to.toISOString()}` : 
    'all';

  const queryConfig = {
    queryKey: ['orders', businessType, options?.status || 'all', dateRangeKey],
    table: 'orders' as const,
    select: 'id, order_number, business_type, status, total_amount, payment_method, payment_status, notes, customer_id, created_at, updated_at, finished_at',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    pageSize: options?.limit || 50,
    businessType
  };

  const {
    data: rawOrders,
    isLoading,
    isError,
    error,
    refetch,
    invalidate,
    prefetchNext,
    hasMore
  } = useOptimizedQuery(queryConfig);

  // Transform the raw data to typed orders
  const orders: Order[] = rawOrders.map((item: any) => ({
    id: item.id,
    order_number: item.order_number,
    business_type: item.business_type as BusinessType,
    status: item.status,
    total_amount: item.total_amount,
    payment_method: item.payment_method,
    payment_status: item.payment_status,
    notes: item.notes,
    customer_id: item.customer_id,
    user_id: item.user_id,
    created_at: item.created_at,
    updated_at: item.updated_at,
    finished_at: item.finished_at
  }));

  // Fixed real-time subscription with proper filter format
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log(`Setting up real-time for ${businessType} orders, user: ${user.id}`);

      channel = supabase
        .channel(`orders_optimized_${businessType}_${user.id}_${Date.now()}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('Order real-time update:', payload.eventType, payload);
          
          // Only invalidate if it's for this business type
          if (payload.new?.business_type === businessType || payload.old?.business_type === businessType) {
            setTimeout(() => {
              queryClient.invalidateQueries({ 
                queryKey: ['orders', businessType] 
              });
            }, 100);
          }
        })
        .subscribe((status) => {
          console.log(`Real-time subscription status for ${businessType}:`, status);
        });
    };

    setupRealtime();
    
    return () => {
      if (channel) {
        console.log(`Cleaning up real-time channel for ${businessType}`);
        supabase.removeChannel(channel);
      }
    };
  }, [businessType, queryClient]);

  const createOrder = async (orderData: Partial<Order>) => {
    const result = await createOrderOp(businessType, orderData);
    if (result && result.success) {
      invalidate();
      return result.success;
    }
    return false;
  };

  return {
    orders,
    loading: isLoading,
    error: isError ? error : null,
    refetch,
    invalidate,
    hasMore,
    prefetchNext,
    createOrder,
    updateOrderStatus
  };
};
