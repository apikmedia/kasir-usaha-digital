
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
    console.log('Initializing customer data for business type:', businessType);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      setCurrentUserId(user?.id || null);
      
      if (user?.id) {
        const fetchedCustomers = await fetchCustomers();
        console.log('Fetched customers count:', fetchedCustomers.length);
        setCustomers(fetchedCustomers);
      }
    } catch (error) {
      console.error('Error initializing customer data:', error);
      setLoading(false);
    }
  };

  // Simplified real-time subscription
  useEffect(() => {
    if (!currentUserId) {
      console.log('No current user, skipping real-time subscription');
      return;
    }

    console.log('Setting up customer real-time subscription for:', businessType, 'user:', currentUserId);

    const channelName = `customers-${currentUserId}-${businessType || 'all'}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `user_id=eq.${currentUserId}`
        },
        (payload) => {
          console.log('Real-time customer update received:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT' && payload.new) {
            const newCustomerData = payload.new as any;
            if (!businessType || newCustomerData.business_type === businessType) {
              addCustomer(newCustomerData);
            }
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedCustomerData = payload.new as any;
            if (!businessType || updatedCustomerData.business_type === businessType) {
              updateCustomer(updatedCustomerData);
            } else {
              removeCustomer(updatedCustomerData.id);
            }
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedCustomerData = payload.old as any;
            removeCustomer(deletedCustomerData.id);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up customer subscription:', channelName);
      supabase.removeChannel(channel);
    };
  }, [currentUserId, businessType]);

  // Initial fetch only once
  useEffect(() => {
    initializeAndFetch();
  }, []); // Remove businessType dependency to prevent re-fetching

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
