
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Service, BusinessType } from './types';

interface UseServiceRealtimeProps {
  businessType: BusinessType;
  currentUserId: string | null;
  addService: (service: Service) => void;
  updateServiceInState: (service: Service) => void;
  removeService: (serviceId: string) => void;
}

export const useServiceRealtime = ({ 
  businessType, 
  currentUserId, 
  addService, 
  updateServiceInState, 
  removeService 
}: UseServiceRealtimeProps) => {
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`services-${businessType}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `business_type=eq.${businessType}`
        },
        (payload) => {
          console.log('Real-time services update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newServiceData = payload.new as any;
            if (newServiceData && newServiceData.user_id === currentUserId) {
              addService(newServiceData as Service);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedServiceData = payload.new as any;
            if (updatedServiceData && updatedServiceData.user_id === currentUserId) {
              updateServiceInState(updatedServiceData as Service);
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedServiceData = payload.old as any;
            if (deletedServiceData && deletedServiceData.user_id === currentUserId) {
              removeService(deletedServiceData.id);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Services subscription status:', status);
      });

    return () => {
      console.log('Cleaning up services subscription');
      supabase.removeChannel(channel);
    };
  }, [businessType, currentUserId, addService, updateServiceInState, removeService]);
};
