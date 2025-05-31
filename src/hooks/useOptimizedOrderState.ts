
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Order, BusinessType } from '@/types/order';

interface OrderCache {
  [key: string]: {
    data: Order[];
    timestamp: number;
  };
}

const CACHE_DURATION = 20000; // 20 seconds for orders (more frequent updates)

export const useOptimizedOrderState = (businessType: BusinessType) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const cacheRef = useRef<OrderCache>({});
  const initialLoadRef = useRef(false);

  const getCacheKey = () => `orders_${businessType}`;

  const getCachedOrders = (): Order[] | null => {
    const cached = cacheRef.current[getCacheKey()];
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
      delete cacheRef.current[getCacheKey()];
      return null;
    }
    
    return cached.data;
  };

  const setCachedOrders = (data: Order[]) => {
    cacheRef.current[getCacheKey()] = {
      data,
      timestamp: Date.now()
    };
  };

  const fetchOrders = async (force = false) => {
    try {
      // Check cache first unless forced
      if (!force) {
        const cachedData = getCachedOrders();
        if (cachedData) {
          console.log('Using cached order data');
          setOrders(cachedData);
          return;
        }
      }

      console.log('Fetching orders for:', businessType);
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('business_type', businessType)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100); // Limit for performance

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      console.log('Fetched orders:', data);
      const fetchedOrders = data || [];
      setOrders(fetchedOrders);
      setCachedOrders(fetchedOrders);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pesanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addOrder = (newOrder: Order) => {
    setOrders(prev => {
      const updated = [newOrder, ...prev];
      setCachedOrders(updated);
      return updated;
    });
  };

  const updateOrderInState = (orderId: string, updateData: Partial<Order>) => {
    setOrders(prev => {
      const updated = prev.map(order => 
        order.id === orderId 
          ? { ...order, ...updateData }
          : order
      );
      setCachedOrders(updated);
      return updated;
    });
  };

  // Initial load
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchOrders();
    }
  }, [businessType]);

  // Simplified real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`orders-optimized-${businessType}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `business_type=eq.${businessType}`
        },
        (payload) => {
          console.log('Real-time orders update:', payload);
          // Only refresh if needed
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            addOrder(newOrder);
          } else {
            // For updates and deletes, do a quick refresh
            fetchOrders(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessType]);

  return {
    orders,
    loading,
    setOrders,
    addOrder,
    updateOrderInState,
    refetch: () => fetchOrders(true)
  };
};
