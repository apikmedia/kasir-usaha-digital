
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseProductRealtimeProps {
  invalidateAndRefresh: () => void;
}

export const useProductRealtime = ({ invalidateAndRefresh }: UseProductRealtimeProps) => {
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`products_realtime_${user.id}_${Date.now()}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('Product real-time update:', payload.eventType, payload);
          // Immediate refresh for all product changes
          invalidateAndRefresh();
        })
        .subscribe((status) => {
          console.log('Products realtime subscription status:', status);
        });
    };

    setupRealtime();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [invalidateAndRefresh]);
};
