
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pelanggan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
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
        .from('customers')
        .insert({
          ...customerData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setCustomers(prev => [...prev, data]);
      toast({
        title: "Berhasil",
        description: "Pelanggan berhasil ditambahkan",
      });
      return data;
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan pelanggan",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    customers,
    loading,
    createCustomer,
    refetch: fetchCustomers
  };
};
