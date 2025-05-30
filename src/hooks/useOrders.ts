
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
  }, [businessType]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('business_type', businessType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pesanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: Partial<Order>) => {
    try {
      // Check daily limit first
      const { data: limitCheck, error: limitError } = await supabase
        .rpc('check_daily_limit');

      if (limitError) throw limitError;
      
      if (!limitCheck) {
        toast({
          title: "Limit Tercapai",
          description: "Batas transaksi harian telah tercapai. Upgrade ke Premium untuk transaksi unlimited.",
          variant: "destructive",
        });
        return false;
      }

      // Generate order number
      const businessPrefix = businessType === 'laundry' ? 'LDY' : 
                           businessType === 'warung' ? 'WRG' : 'CMT';
      
      const { data: orderNumber, error: orderNumberError } = await supabase
        .rpc('generate_order_number', { business_prefix: businessPrefix });

      if (orderNumberError) throw orderNumberError;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "User tidak ditemukan",
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          order_number: orderNumber,
          business_type: businessType,
          user_id: user.id,
          total_amount: orderData.total_amount || 0
        })
        .select()
        .single();

      if (error) throw error;

      setOrders(prev => [data, ...prev]);
      toast({
        title: "Berhasil",
        description: "Pesanan berhasil dibuat",
      });
      return true;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Gagal membuat pesanan",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'antrian' | 'proses' | 'selesai') => {
    try {
      const updateData: any = { status };
      if (status === 'selesai') {
        updateData.finished_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

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
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui status pesanan",
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
