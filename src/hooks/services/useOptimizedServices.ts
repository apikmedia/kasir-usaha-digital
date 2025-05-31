
import { useOptimizedQuery } from '../useOptimizedQuery';
import { useServiceOperations } from './useServiceOperations';
import { useQueryClient } from '@tanstack/react-query';
import type { Service, BusinessType } from './types';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedServices = (businessType: BusinessType) => {
  const queryClient = useQueryClient();
  
  const queryConfig = {
    queryKey: ['services', businessType],
    table: 'services',
    select: 'id, name, description, price, unit, estimated_duration, is_active, business_type, user_id, created_at, updated_at',
    filters: {
      business_type: businessType,
      is_active: true
    },
    orderBy: { column: 'name', ascending: true },
    pageSize: 100,
    businessType
  };

  const {
    data: services,
    isLoading,
    isError,
    error,
    refetch,
    invalidate,
    prefetchNext,
    hasMore
  } = useOptimizedQuery<Service>(queryConfig);

  const {
    createService,
    updateService,
    deleteService: deleteServiceOp
  } = useServiceOperations(
    businessType,
    () => invalidate(),
    () => invalidate(),
    () => invalidate()
  );

  // Optimized real-time subscription
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use more specific channel name to avoid conflicts
      channel = supabase
        .channel(`services_optimized_${businessType}_${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `user_id=eq.${user.id} AND business_type=eq.${businessType}`
        }, (payload) => {
          console.log('Service real-time update:', payload.eventType);
          
          // Throttled invalidation to prevent excessive re-fetching
          setTimeout(() => {
            queryClient.invalidateQueries({ 
              queryKey: ['services', businessType] 
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

  const deleteService = async (id: string) => {
    const result = await deleteServiceOp(id);
    if (result) {
      invalidate();
    }
    return result;
  };

  return {
    services,
    loading: isLoading,
    error: isError ? error : null,
    createService: async (serviceData: Omit<Service, 'id' | 'business_type' | 'user_id'>) => {
      const result = await createService(serviceData);
      invalidate();
      return result;
    },
    updateService: async (id: string, serviceData: Partial<Omit<Service, 'id' | 'business_type' | 'user_id'>>) => {
      const result = await updateService(id, serviceData);
      invalidate();
      return result;
    },
    deleteService,
    refetch,
    hasMore,
    prefetchNext
  };
};
