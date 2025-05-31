
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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Enhanced real-time subscription with better error handling
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
          
          try {
            if (payload.eventType === 'INSERT' && payload.new) {
              const newCustomerData = payload.new as any;
              if (!businessType || newCustomerData.business_type === businessType) {
                console.log('Adding new customer to state:', newCustomerData.id);
                addCustomer(newCustomerData);
              }
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              const updatedCustomerData = payload.new as any;
              if (!businessType || updatedCustomerData.business_type === businessType) {
                console.log('Updating customer in state:', updatedCustomerData.id);
                updateCustomer(updatedCustomerData);
              } else {
                console.log('Customer business type changed, removing from list:', updatedCustomerData.id);
                removeCustomer(updatedCustomerData.id);
              }
            } else if (payload.eventType === 'DELETE' && payload.old) {
              const deletedCustomerData = payload.old as any;
              console.log('Removing customer from state via real-time:', deletedCustomerData.id);
              removeCustomer(deletedCustomerData.id);
              // Ensure loading state is cleared when delete is processed
              setLoading(false);
            }
          } catch (error) {
            console.error('Error handling real-time customer update:', error);
            // Force refresh if real-time update fails
            console.log('Forcing data refresh due to real-time error');
            initializeAndFetch();
          }
        }
      )
      .subscribe((status) => {
        console.log('Customer subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to customer real-time updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error, attempting to refresh data');
          initializeAndFetch();
        }
      });

    return () => {
      console.log('Cleaning up customer subscription:', channelName);
      supabase.removeChannel(channel);
    };
  }, [currentUserId, businessType]);

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
