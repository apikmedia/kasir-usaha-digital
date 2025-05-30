
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
  business_type: 'laundry' | 'warung' | 'cuci_motor';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useCustomers = (businessType?: 'laundry' | 'warung' | 'cuci_motor') => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get current user ID first
    const initializeUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    
    initializeUser();
    fetchCustomers();
    
    // Set up real-time subscription for customers
    const channel = supabase
      .channel(`customers-${businessType || 'all'}-${Date.now()}`) // Unique channel name
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        (payload) => {
          console.log('Real-time customers update:', payload);
          
          // Handle different event types for immediate UI updates
          if (payload.eventType === 'INSERT') {
            const newCustomer = payload.new as Customer;
            if (newCustomer.user_id === currentUserId && 
                (!businessType || newCustomer.business_type === businessType)) {
              setCustomers(prev => [...prev, newCustomer].sort((a, b) => a.name.localeCompare(b.name)));
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedCustomer = payload.new as Customer;
            if (updatedCustomer.user_id === currentUserId) {
              setCustomers(prev => {
                const filtered = prev.filter(customer => customer.id !== updatedCustomer.id);
                // Only add back if it matches the business type filter
                if (!businessType || updatedCustomer.business_type === businessType) {
                  return [...filtered, updatedCustomer].sort((a, b) => a.name.localeCompare(b.name));
                }
                return filtered;
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedCustomer = payload.old as Customer;
            setCustomers(prev => prev.filter(customer => customer.id !== deletedCustomer.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Customers subscription status:', status);
      });

    return () => {
      console.log('Cleaning up customers subscription');
      supabase.removeChannel(channel);
    };
  }, [currentUserId, businessType]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      let query = supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id);

      // Filter by business type if provided
      if (businessType) {
        query = query.eq('business_type', businessType);
      }

      const { data, error } = await query.order('name');

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

      // The real-time subscription will handle the UI update automatically
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

  const updateCustomer = async (id: string, customerData: Partial<Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // The real-time subscription will handle the UI update automatically
      toast({
        title: "Berhasil",
        description: "Data pelanggan berhasil diperbarui",
      });
      return data;
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui data pelanggan",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // The real-time subscription will handle the UI update automatically
      toast({
        title: "Berhasil",
        description: "Pelanggan berhasil dihapus",
      });
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus pelanggan",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers
  };
};
