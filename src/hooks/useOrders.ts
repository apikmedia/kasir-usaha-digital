
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Order {
  id: string;
  order_number: string;
  business_type: 'laundry' | 'warung' | 'cuci_motor';
  status: 'antrian' | 'proses' | 'selesai';
  total_amount: number;
  payment_method?: 'cash' | 'transfer';
  payment_status: boolean;
  notes?: string;
  estimated_finish?: string;
  finished_at?: string;
  created_at: string;
  customer_id?: string;
  user_id: string;
}

export const useOrders = (businessType: 'laundry' | 'warung' | 'cuci_motor') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`orders-${businessType}-${Date.now()}`)
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
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessType]);

  const fetchOrders = async () => {
    try {
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      console.log('Fetched orders:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pesanan: " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: Partial<Order>) => {
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

      console.log('Current user:', user.id);

      // Check daily limit first
      console.log('Checking daily limit...');
      const { data: limitCheck, error: limitError } = await supabase
        .rpc('check_daily_limit');

      if (limitError) {
        console.error('Error checking limit:', limitError);
        throw limitError;
      }
      
      console.log('Daily limit check result:', limitCheck);
      
      if (!limitCheck) {
        toast({
          title: "Limit Tercapai",
          description: "Batas transaksi harian telah tercapai. Upgrade ke Premium untuk transaksi unlimited.",
          variant: "destructive",
        });
        return false;
      }

      // Generate order number using the corrected function
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

      console.log('Inserting order:', newOrder);

      const { data, error } = await supabase
        .from('orders')
        .insert(newOrder)
        .select()
        .single();

      if (error) {
        console.error('Error inserting order:', error);
        throw new Error(`Gagal menyimpan pesanan: ${error.message}`);
      }

      console.log('Order created successfully:', data);

      toast({
        title: "Berhasil",
        description: "Pesanan berhasil dibuat dengan nomor: " + orderNumber,
      });
      
      // Add the new order to the state immediately
      setOrders(prev => [data, ...prev]);
      
      return true;
    } catch (error) {
      console.error('Error in createOrder:', error);
      toast({
        title: "Error",
        description: "Gagal membuat pesanan: " + (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'antrian' | 'proses' | 'selesai') => {
    try {
      console.log('Updating order status:', orderId, status);
      
      const updateData: any = { status };
      if (status === 'selesai') {
        updateData.finished_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, ...updateData }
          : order
      ));

      toast({
        title: "Berhasil",
        description: "Status pesanan berhasil diperbarui",
      });
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui status pesanan: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    refetch: fetchOrders
  };
};
