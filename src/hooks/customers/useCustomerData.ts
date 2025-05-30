
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BusinessType } from '@/types/customer';
import { useCustomerFetch } from './useCustomerFetch';
import { useCustomerState } from './useCustomerState';

export const useCustomerData = (businessType?: BusinessType) => {
  const { loading, setLoading, fetchCustomers } = useCustomerFetch(businessType);
  const {
    customers,
    setCustomers,
    currentUserId,
    setCurrentUserId,
    addCustomer,
    updateCustomer,
    removeCustomer
  } = useCustomerState();

  const initializeAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
    
    const fetchedCustomers = await fetchCustomers();
    setCustomers(fetchedCustomers);
  };

  useEffect(() => {
    initializeAndFetch();
  }, [businessType]);

  return {
    customers,
    setCustomers,
    loading,
    currentUserId,
    fetchCustomers: initializeAndFetch,
    addCustomer,
    updateCustomer,
    removeCustomer
  };
};
