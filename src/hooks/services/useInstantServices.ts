
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
      .select('id, name, description, price, unit, estimated_duration, is_active, business_type, user_id, created_at, updated_at')
      .eq('business_type', businessType)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('name')
      .limit(100);

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
    ttl: 15000, // Reduce TTL for faster updates
    autoRefresh: true
  });

  // Optimized real-time updates with immediate refresh
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`services-instant-${businessType}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'services',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time service update:', payload);
            // Immediate refresh for faster updates
            setTimeout(() => refresh(), 50);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Services real-time subscription ready');
          }
        });
    };

    setupRealtime();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [businessType, refresh]);

  return {
    services,
    loading: false,
    refetch: refresh,
    invalidate
  };
};
