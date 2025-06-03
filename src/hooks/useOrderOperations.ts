
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { Order, BusinessType, OrderStatus } from '@/types/order';

export const useOrderOperations = () => {
  const { toast } = useToast();
  const { trackOrderCreated, trackOrderCompleted } = useAnalytics();

  const createOrder = async (businessType: BusinessType, orderData: Partial<Order>) => {
    try {
      console.log('Creating order with data:', orderData);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "User tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        });
        return false;
      }

      // Show immediate feedback
      toast({
        title: "Memproses",
        description: "Sedang membuat pesanan...",
      });

      console.log('Current user:', user.id);

      // Enhanced daily limit check with better logging
      console.log('Checking daily limit for business type:', businessType);
      const { data: limitCheck, error: limitError } = await supabase
        .rpc('check_daily_limit');

      console.log('Daily limit check - Data:', limitCheck, 'Error:', limitError);

      if (limitError) {
        console.error('Error checking limit:', limitError);
        throw new Error(`Error checking daily limit: ${limitError.message}`);
      }
      
      if (!limitCheck) {
        // Get current transaction count for better error reporting
        const { data: currentCount, error: countError } = await supabase
          .rpc('get_daily_count');
          
        const currentTransactionCount = currentCount || 0;
        console.log('Current transaction count:', currentTransactionCount);
        
        toast({
          title: "Limit Tercapai",
          description: `Batas transaksi harian telah tercapai (${currentTransactionCount}/20). Upgrade ke Premium untuk transaksi unlimited.`,
          variant: "destructive",
        });
        return false;
      }

      // Generate order number
      const businessPrefix = businessType === 'laundry' ? 'LDY' : 
                           businessType === 'warung' ? 'WRG' : 'CMT';
      
      console.log('Generating order number with prefix:', businessPrefix);
      
      const { data: orderNumber, error: orderNumberError } = await supabase
        .rpc('generate_order_number', { business_prefix: businessPrefix });

      if (orderNumberError) {
        console.error('Error generating order number:', orderNumberError);
        throw new Error(`Gagal membuat nomor pesanan: ${orderNumberError.message}`);
      }

      if (!orderNumber) {
        throw new Error('Nomor pesanan tidak berhasil dibuat');
      }

      console.log('Generated order number:', orderNumber);

      // Type-safe order creation with proper casting
      const newOrder = {
        order_number: orderNumber,
        business_type: businessType,
        user_id: user.id,
        total_amount: orderData.total_amount || 0,
        status: (orderData.status || 'antrian') as any, // Cast to any to handle enum compatibility
        payment_status: orderData.payment_status || false,
        notes: orderData.notes || null,
        customer_id: orderData.customer_id || null,
        payment_method: orderData.payment_method || null
      };

      console.log('Inserting order:', newOrder);

      const { data, error } = await supabase
        .from('orders')
        .insert(newOrder)
        .select()
        .single();

      if (error) {
        console.error('Error inserting order:', error);
        throw error;
      }

      console.log('Order created successfully:', data);

      // Track analytics event
      await trackOrderCreated(businessType, {
        order_id: data.id,
        order_number: data.order_number,
        total_amount: data.total_amount,
        customer_id: data.customer_id
      });

      toast({
        title: "Berhasil",
        description: "Pesanan berhasil dibuat dengan nomor: " + orderNumber,
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in createOrder:', error);
      toast({
        title: "Error",
        description: "Gagal membuat pesanan: " + (error as Error).message,
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      console.log('Updating order status:', orderId, status);
      
      // Show immediate feedback
      toast({
        title: "Memproses",
        description: "Sedang memperbarui status pesanan...",
      });
      
      const updateData: any = { status: status as any }; // Cast to any for enum compatibility
      
      // For different business types, handle completion differently
      if (status === 'selesai' || status === 'belum_bayar') {
        updateData.finished_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      // Track analytics event for completed orders
      if (status === 'selesai') {
        await trackOrderCompleted(data.business_type, {
          order_id: data.id,
          order_number: data.order_number,
          total_amount: data.total_amount,
          customer_id: data.customer_id
        });
      }

      toast({
        title: "Berhasil",
        description: "Status pesanan berhasil diperbarui",
      });

      return { success: true, updateData };
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui status pesanan: " + (error as Error).message,
        variant: "destructive",
      });
      return { success: false };
    }
  };

  return {
    createOrder,
    updateOrderStatus
  };
};
