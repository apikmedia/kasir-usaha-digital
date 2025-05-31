
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Order, BusinessType, OrderStatus } from '@/types/order';

interface OrdersResponse {
  orders: Order[];
  totalCount: number;
  hasMore: boolean;
}

interface UseOrdersPaginationProps {
  businessType: BusinessType;
  page: number;
  pageSize: number;
}

export const useOrdersPagination = ({ businessType, page, pageSize }: UseOrdersPaginationProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchOrders = async (): Promise<OrdersResponse> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get total count
    const { count, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('business_type', businessType)
      .eq('user_id', user.id);

    if (countError) throw countError;

    // Get paginated data with all required fields
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, business_type, status, total_amount, created_at, finished_at, notes, customer_id, payment_status, user_id, payment_method, estimated_finish')
      .eq('business_type', businessType)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      orders: data || [],
      totalCount: count || 0,
      hasMore: (count || 0) > to + 1
    };
  };

  const ordersQuery = useQuery({
    queryKey: ['orders', businessType, page, pageSize],
    queryFn: fetchOrders,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const updateData: any = { status };
      if (status === 'selesai') {
        updateData.finished_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', businessType] });
      toast({
        title: "Berhasil",
        description: "Status pesanan berhasil diperbarui",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal memperbarui status pesanan: " + error.message,
        variant: "destructive",
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: Partial<Order>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check daily limit
      const { data: limitCheck, error: limitError } = await supabase
        .rpc('check_daily_limit');

      if (limitError) throw limitError;
      if (!limitCheck) throw new Error('Batas transaksi harian telah tercapai');

      // Generate order number
      const businessPrefix = businessType === 'laundry' ? 'LDY' : 
                           businessType === 'warung' ? 'WRG' : 'CMT';
      
      const { data: orderNumber, error: orderNumberError } = await supabase
        .rpc('generate_order_number', { business_prefix: businessPrefix });

      if (orderNumberError || !orderNumber) {
        throw new Error('Gagal membuat nomor pesanan');
      }

      const newOrder = {
        order_number: orderNumber,
        business_type: businessType,
        user_id: user.id,
        total_amount: orderData.total_amount || 0,
        status: orderData.status || 'antrian',
        payment_status: orderData.payment_status || false,
        notes: orderData.notes || null,
        customer_id: orderData.customer_id || null,
        payment_method: orderData.payment_method || null
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(newOrder)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders', businessType] });
      toast({
        title: "Berhasil",
        description: `Pesanan berhasil dibuat dengan nomor: ${data.order_number}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal membuat pesanan: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    orders: ordersQuery.data?.orders || [],
    totalCount: ordersQuery.data?.totalCount || 0,
    hasMore: ordersQuery.data?.hasMore || false,
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    updateOrderStatus: updateOrderMutation.mutate,
    createOrder: createOrderMutation.mutate,
    isUpdating: updateOrderMutation.isPending,
    isCreating: createOrderMutation.isPending,
    refetch: ordersQuery.refetch
  };
};
