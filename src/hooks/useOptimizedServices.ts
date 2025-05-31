
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSimpleCache } from './useSimpleCache';
import type { Service, BusinessType } from './services/types';

export const useOptimizedServices = (businessType: BusinessType) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const cache = useSimpleCache();
  const { toast } = useToast();
  
  const cacheKey = `services_${businessType}`;

  const fetchServices = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      // Check cache first
      const cached = cache.get<Service[]>(cacheKey);
      if (cached) {
        setServices(cached);
        if (showLoading) setLoading(false);
        return cached;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setServices([]);
        if (showLoading) setLoading(false);
        return [];
      }

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_type', businessType)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching services:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data layanan",
          variant: "destructive",
        });
        if (showLoading) setLoading(false);
        return [];
      }

      const servicesData = data || [];
      setServices(servicesData);
      cache.set(cacheKey, servicesData);
      
      if (showLoading) setLoading(false);
      return servicesData;
    } catch (error) {
      console.error('Error in fetchServices:', error);
      if (showLoading) setLoading(false);
      return [];
    }
  };

  const invalidateAndRefresh = () => {
    cache.invalidate(cacheKey);
    fetchServices(false);
  };

  useEffect(() => {
    fetchServices();
  }, [businessType]);

  // Simple real-time updates
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`services_${businessType}_${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          const record = payload.new || payload.old;
          // Add type guard to safely check business_type
          if (record && typeof record === 'object' && 'business_type' in record) {
            if (record.business_type === businessType) {
              invalidateAndRefresh();
            }
          }
        })
        .subscribe();
    };

    setupRealtime();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [businessType]);

  return {
    services,
    loading,
    refetch: () => fetchServices(),
    invalidate: invalidateAndRefresh
  };
};
