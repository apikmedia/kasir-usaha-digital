
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BusinessType, Customer } from '@/types/customer';
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
    
    if (user?.id) {
      const fetchedCustomers = await fetchCustomers();
      setCustomers(fetchedCustomers);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!currentUserId) return;

    console.log('Setting up customer real-time subscription for:', businessType, 'user:', currentUserId);

    const channel = supabase
      .channel(`customers-realtime-${businessType || 'all'}-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `user_id=eq.${currentUserId}`
        },
        (payload) => {
          console.log('Real-time customers update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newCustomerData = payload.new as any;
            if (newCustomerData && 
                (!businessType || newCustomerData.business_type === businessType)) {
              console.log('Adding new customer to state:', newCustomerData);
              addCustomer(newCustomerData);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedCustomerData = payload.new as any;
            if (updatedCustomerData) {
              console.log('Updating customer in state:', updatedCustomerData);
              if (!businessType || updatedCustomerData.business_type === businessType) {
                updateCustomer(updatedCustomerData);
              } else {
                // If business type changed and doesn't match filter, remove from list
                removeCustomer(updatedCustomerData.id);
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedCustomerData = payload.old as any;
            if (deletedCustomerData) {
              console.log('Removing customer from state:', deletedCustomerData.id);
              removeCustomer(deletedCustomerData.id);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Customer subscription status:', status);
      });

    return () => {
      console.log('Cleaning up customer subscription');
      supabase.removeChannel(channel);
    };
  }, [currentUserId, businessType, addCustomer, updateCustomer, removeCustomer]);

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
