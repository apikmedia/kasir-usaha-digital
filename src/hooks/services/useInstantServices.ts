
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useInstantData } from '../useInstantData';
import type { Service, BusinessType } from './types';

export const useInstantServices = (businessType: BusinessType) => {
  const { toast } = useToast();
  
  const cacheKey = `services_${businessType}`;

  const fetchServices = async (): Promise<Service[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_type', businessType)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('name')
      .limit(200);

    if (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data layanan",
        variant: "destructive",
      });
      return [];
    }

    return data || [];
  };

  const { data: services, refresh, invalidate } = useInstantData({
    cacheKey,
    fetchFn: fetchServices,
    defaultData: [] as Service[],
    ttl: 25000
  });

  // Real-time updates
  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel(`services-instant-${businessType}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'services',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            refresh();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, [businessType]);

  return {
    services,
    loading: false,
    refetch: refresh,
    invalidate
  };
};
