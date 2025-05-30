
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Customer, BusinessType } from '@/types/customer';

interface UseCustomerRealtimeProps {
  businessType?: BusinessType;
  currentUserId: string | null;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export const useCustomerRealtime = ({ businessType, currentUserId, setCustomers }: UseCustomerRealtimeProps) => {
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`customers-${businessType || 'all'}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        (payload) => {
          console.log('Real-time customers update:', payload);
          
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
  }, [currentUserId, businessType, setCustomers]);
};
