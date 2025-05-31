
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useInstantData } from '../useInstantData';
import type { Customer, BusinessType } from '@/types/customer';

export const useInstantCustomers = (businessType?: BusinessType) => {
  const { toast } = useToast();
  
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

    const { data, error } = await query.order('name').limit(200); // Reduced limit

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

  const { data: customers, isLoading, refresh, invalidate } = useInstantData({
    cacheKey,
    fetchFn: fetchCustomers,
    defaultData: [] as Customer[],
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
        .channel(`customers-realtime-${cacheKey}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'customers',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Customer real-time update:', payload.eventType, payload);
            
            const newRecord = payload.new as any;
            const oldRecord = payload.old as any;
            
            // Check if update affects our business type filter
            const affectsOurData = !businessType || 
              (newRecord && newRecord.business_type === businessType) ||
              (oldRecord && oldRecord.business_type === businessType);
            
            if (affectsOurData) {
              console.log('Triggering immediate customer refresh');
              invalidate(); // This now auto-refreshes
            }
          }
        )
        .subscribe((status) => {
          console.log('Customers realtime subscription status:', status);
        });
    };

    setupRealtime();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [cacheKey, businessType, invalidate]);

  return {
    customers,
    loading: isLoading,
    refetch: refresh,
    invalidate
  };
};
