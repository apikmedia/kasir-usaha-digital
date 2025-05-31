
import { useOptimizedQuery } from '../useOptimizedQuery';
import { useCustomerOperations } from './useCustomerOperations';
import { useQueryClient } from '@tanstack/react-query';
import type { Customer, BusinessType } from '@/types/customer';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedCustomers = (businessType?: BusinessType) => {
  const queryClient = useQueryClient();
  
  const queryConfig = {
    queryKey: businessType ? ['customers', businessType] : ['customers', 'all'],
    table: 'customers' as const,
    select: 'id, name, phone, email, address, notes, business_type, user_id, created_at, updated_at',
    filters: businessType ? { business_type: businessType } : {},
    orderBy: { column: 'name', ascending: true },
    pageSize: 100,
    businessType
  };

  const {
    data: customers,
    isLoading,
    isError,
    error,
    refetch,
    invalidate,
    prefetchNext,
    hasMore
  } = useOptimizedQuery<Customer>(queryConfig);

  const { 
    createCustomer: createCustomerOperation, 
    updateCustomer: updateCustomerOperation, 
    deleteCustomer: deleteCustomerOperation 
  } = useCustomerOperations();

  // Optimized real-time subscription
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const filterStr = businessType 
        ? `user_id=eq.${user.id} AND business_type=eq.${businessType}`
        : `user_id=eq.${user.id}`;

      channel = supabase
        .channel(`customers_optimized_${businessType || 'all'}_${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: filterStr
        }, (payload) => {
          console.log('Customer real-time update:', payload.eventType);
          
          // Throttled invalidation
          setTimeout(() => {
            queryClient.invalidateQueries({ 
              queryKey: businessType ? ['customers', businessType] : ['customers', 'all']
            });
          }, 100);
        })
        .subscribe();
    };

    setupRealtime();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [businessType, queryClient]);

  const createCustomer = async (customerData: any) => {
    console.log('Creating customer:', customerData.name);
    const result = await createCustomerOperation(customerData);
    if (result && typeof result === 'object') {
      console.log('Customer created successfully');
      invalidate();
      return result;
    }
    return false;
  };

  const updateCustomer = async (id: string, customerData: any) => {
    console.log('Updating customer:', id, customerData.name);
    const result = await updateCustomerOperation(id, customerData);
    if (result && typeof result === 'object') {
      console.log('Customer updated successfully');
      invalidate();
      return result;
    }
    return false;
  };

  const deleteCustomer = async (id: string) => {
    console.log('Deleting customer:', id);
    const result = await deleteCustomerOperation(id);
    if (result) {
      console.log('Customer deleted successfully');
      invalidate();
      return true;
    } else {
      console.log('Delete failed');
      return false;
    }
  };

  return {
    customers,
    loading: isLoading,
    error: isError ? error : null,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch,
    hasMore,
    prefetchNext
  };
};
