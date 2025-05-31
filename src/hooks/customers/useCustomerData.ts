
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
    console.log('Initializing customer data...');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      setCurrentUserId(user?.id || null);
      
      if (user?.id) {
        const fetchedCustomers = await fetchCustomers();
        console.log('Fetched customers:', fetchedCustomers);
        setCustomers(fetchedCustomers);
      }
    } catch (error) {
      console.error('Error initializing customer data:', error);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!currentUserId) {
      console.log('No current user, skipping real-time subscription');
      return;
    }

    console.log('Setting up customer real-time subscription for business type:', businessType, 'user:', currentUserId);

    // Create a unique channel name
    const channelName = `customers-realtime-${currentUserId}-${businessType || 'all'}`;
    
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
          console.log('Real-time customers update received:', payload);
          
          try {
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
          } catch (error) {
            console.error('Error handling real-time customer update:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Customer subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to customer changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to customer changes');
        }
      });

    return () => {
      console.log('Cleaning up customer subscription:', channelName);
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
