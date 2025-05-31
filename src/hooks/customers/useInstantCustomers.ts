
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useInstantData } from '../useInstantData';
import { useGlobalCache } from '../cache/useGlobalCache';
import type { Customer, BusinessType } from '@/types/customer';

export const useInstantCustomers = (businessType?: BusinessType) => {
  const { toast } = useToast();
  const cache = useGlobalCache();
  
  const cacheKey = businessType ? `customers_${businessType}` : 'customers_all';

  const fetchCustomers = async (): Promise<Customer[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('customers')
      .select('id, name, phone, email, address, notes, business_type, user_id, created_at, updated_at')
      .eq('user_id', user.id);

    if (businessType) {
      query = query.eq('business_type', businessType);
    }

    const { data, error } = await query.order('name').limit(500);

    if (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pelanggan",
        variant: "destructive",
      });
      return [];
    }

    return (data || []).map((item): Customer => ({
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
  };

  const { data: customers, refresh, invalidate } = useInstantData({
    cacheKey,
    fetchFn: fetchCustomers,
    defaultData: [] as Customer[],
    ttl: 20000
  });

  // Real-time updates without affecting loading
  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel(`customers-instant-${cacheKey}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'customers',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Silent background refresh
            refresh();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, [cacheKey]);

  return {
    customers,
    loading: false, // Never show loading
    refetch: refresh,
    invalidate
  };
};
