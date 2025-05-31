
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
      .limit(100); // Reduced limit for faster loading

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

  const { data: services, isLoading, refresh, invalidate } = useInstantData({
    cacheKey,
    fetchFn: fetchServices,
    defaultData: [] as Service[],
    ttl: 60000, // 1 minute cache for faster updates
    autoRefresh: true
  });

  // Enhanced real-time updates with immediate refresh
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`services-realtime-${businessType}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'services',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Service real-time update:', payload.eventType, payload);
            
            const newRecord = payload.new as any;
            const oldRecord = payload.old as any;
            
            // Immediate update for relevant business type
            if ((newRecord && newRecord.business_type === businessType) || 
                (oldRecord && oldRecord.business_type === businessType)) {
              console.log('Triggering immediate service refresh');
              invalidate(); // This now auto-refreshes
            }
          }
        )
        .subscribe((status) => {
          console.log('Services realtime subscription status:', status);
        });
    };

    setupRealtime();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [businessType, invalidate]);

  return {
    services,
    loading: isLoading,
    refetch: refresh,
    invalidate
  };
};
