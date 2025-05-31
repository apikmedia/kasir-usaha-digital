
import { useEffect } from 'react';
import { useGlobalCache } from './cache/useGlobalCache';
import { supabase } from '@/integrations/supabase/client';
import type { BusinessType } from '@/types/customer';

export const useAppPreloader = () => {
  const cache = useGlobalCache();

  useEffect(() => {
    const preloadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        console.log('Starting aggressive data preloading...');

        // Preload customers for all business types
        const businessTypes: BusinessType[] = ['laundry', 'cuci_motor', 'warung'];
        
        for (const businessType of businessTypes) {
          // Preload customers
          cache.preload(`customers_${businessType}`, async () => {
            const { data } = await supabase
              .from('customers')
              .select('id, name, phone, email, address, notes, business_type, user_id, created_at, updated_at')
              .eq('user_id', user.id)
              .eq('business_type', businessType)
              .order('name')
              .limit(500);
            return data || [];
          });

          // Preload services
          cache.preload(`services_${businessType}`, async () => {
            const { data } = await supabase
              .from('services')
              .select('id, name, description, price, unit, estimated_duration, is_active, business_type, user_id, created_at, updated_at')
              .eq('business_type', businessType)
              .eq('user_id', user.id)
              .eq('is_active', true)
              .order('name')
              .limit(200);
            return data || [];
          });

          // Preload orders
          cache.preload(`orders_${businessType}`, async () => {
            const { data } = await supabase
              .from('orders')
              .select('*')
              .eq('business_type', businessType)
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(200);
            return data || [];
          });
        }

        console.log('Data preloading completed');
      } catch (error) {
        console.error('Error during preloading:', error);
      }
    };

    // Start preloading after a short delay
    const timer = setTimeout(preloadData, 100);
    return () => clearTimeout(timer);
  }, []);
};
