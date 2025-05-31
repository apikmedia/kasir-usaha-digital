
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSimpleCache } from './useSimpleCache';
import type { Customer, BusinessType } from '@/types/customer';

export const useOptimizedCustomers = (businessType?: BusinessType) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const cache = useSimpleCache();
  const { toast } = useToast();
  
  const cacheKey = businessType ? `customers_${businessType}` : 'customers_all';

  const fetchCustomers = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      // Check cache first
      const cached = cache.get<Customer[]>(cacheKey);
      if (cached) {
        setCustomers(cached);
        if (showLoading) setLoading(false);
        return cached;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCustomers([]);
        if (showLoading) setLoading(false);
        return [];
      }

      let query = supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id);

      if (businessType) {
        query = query.eq('business_type', businessType);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Error fetching customers:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data pelanggan",
          variant: "destructive",
        });
        if (showLoading) setLoading(false);
        return [];
      }

      const customersData = (data || []).map((item): Customer => ({
        id: item.id,
        name: item.name,
        phone: item.phone || undefined,
        email: item.email || undefined,
        address: item.address || undefined,
        notes: item.notes || undefined,
        business_type: item.business_type as BusinessType,
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setCustomers(customersData);
      cache.set(cacheKey, customersData);
      
      if (showLoading) setLoading(false);
      return customersData;
    } catch (error) {
      console.error('Error in fetchCustomers:', error);
      if (showLoading) setLoading(false);
      return [];
    }
  };

  const invalidateAndRefresh = () => {
    cache.invalidate(cacheKey);
    fetchCustomers(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [businessType]);

  // Simple real-time updates
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`customers_${cacheKey}_${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          const record = payload.new || payload.old;
          if (!businessType || (record && record.business_type === businessType)) {
            invalidateAndRefresh();
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
  }, [businessType, cacheKey]);

  return {
    customers,
    loading,
    refetch: () => fetchCustomers(),
    invalidate: invalidateAndRefresh
  };
};
