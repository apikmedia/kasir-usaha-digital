
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Customer, BusinessType } from '@/types/customer';

export const useCustomerOperations = () => {
  const { toast } = useToast();

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Starting customer creation operation...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        toast({
          title: "Error",
          description: "User tidak ditemukan",
          variant: "destructive",
        });
        return false;
      }

      console.log('Inserting customer data:', { ...customerData, user_id: user.id });

      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating customer:', error);
        throw error;
      }

      console.log('Customer created successfully in database:', data);

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
      console.log('Starting customer update operation for ID:', id);
      console.log('Update data:', customerData);

      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Database error updating customer:', error);
        throw error;
      }

      console.log('Customer updated successfully in database:', data);

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
      console.log('Starting customer delete operation for ID:', id);

      // First verify the customer exists and belongs to the current user
      const { data: existingCustomer, error: fetchError } = await supabase
        .from('customers')
        .select('id, name, user_id')
        .eq('id', id)
        .single();

      if (fetchError || !existingCustomer) {
        console.error('Customer not found or fetch error:', fetchError);
        throw new Error('Customer tidak ditemukan');
      }

      console.log('Found customer to delete:', existingCustomer);

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Database error deleting customer:', error);
        throw error;
      }

      console.log('Customer deleted successfully from database');

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
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
};
