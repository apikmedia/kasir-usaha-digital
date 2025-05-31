
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Customer, BusinessType } from '@/types/customer';

export const useCustomerFetch = (businessType?: BusinessType) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCustomers = async (): Promise<Customer[]> => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return [];
      }

      // Optimized query with minimal select and early filtering
      let query = supabase
        .from('customers')
        .select('id, name, phone, email, address, notes, business_type, user_id, created_at, updated_at')
        .eq('user_id', user.id);

      if (businessType) {
        query = query.eq('business_type', businessType);
      }

      // Use limit and order by for better performance
      const { data, error } = await query
        .order('name')
        .limit(1000); // Reasonable limit for performance

      if (error) throw error;
      
      // Quick validation and mapping without extra filtering
      const validCustomers: Customer[] = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        phone: item.phone || undefined,
        email: item.email || undefined,
        address: item.address || undefined,
        notes: item.notes || undefined,
        business_type: item.business_type as BusinessType,
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      return validCustomers;
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pelanggan",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    fetchCustomers
  };
};
