
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
            const newCustomerData = payload.new as any;
            if (newCustomerData && newCustomerData.user_id === currentUserId && 
                (!businessType || newCustomerData.business_type === businessType)) {
              const typedCustomer: Customer = {
                id: newCustomerData.id,
                name: newCustomerData.name,
                phone: newCustomerData.phone || undefined,
                email: newCustomerData.email || undefined,
                address: newCustomerData.address || undefined,
                notes: newCustomerData.notes || undefined,
                business_type: newCustomerData.business_type as BusinessType,
                user_id: newCustomerData.user_id,
                created_at: newCustomerData.created_at,
                updated_at: newCustomerData.updated_at
              };
              setCustomers(prev => [...prev, typedCustomer].sort((a, b) => a.name.localeCompare(b.name)));
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedCustomerData = payload.new as any;
            if (updatedCustomerData && updatedCustomerData.user_id === currentUserId) {
              setCustomers(prev => {
                const filtered = prev.filter(customer => customer.id !== updatedCustomerData.id);
                if (!businessType || updatedCustomerData.business_type === businessType) {
                  const typedCustomer: Customer = {
                    id: updatedCustomerData.id,
                    name: updatedCustomerData.name,
                    phone: updatedCustomerData.phone || undefined,
                    email: updatedCustomerData.email || undefined,
                    address: updatedCustomerData.address || undefined,
                    notes: updatedCustomerData.notes || undefined,
                    business_type: updatedCustomerData.business_type as BusinessType,
                    user_id: updatedCustomerData.user_id,
                    created_at: updatedCustomerData.created_at,
                    updated_at: updatedCustomerData.updated_at
                  };
                  return [...filtered, typedCustomer].sort((a, b) => a.name.localeCompare(b.name));
                }
                return filtered;
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedCustomerData = payload.old as any;
            if (deletedCustomerData) {
              setCustomers(prev => prev.filter(customer => customer.id !== deletedCustomerData.id));
            }
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
