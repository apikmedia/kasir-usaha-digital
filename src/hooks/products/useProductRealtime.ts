
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseProductRealtimeProps {
  invalidateAndRefresh: () => Promise<any>;
}

export const useProductRealtime = ({ invalidateAndRefresh }: UseProductRealtimeProps) => {
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log(`Setting up real-time for products, user: ${user.id}`);

      channel = supabase
        .channel(`products_realtime_${user.id}_${Date.now()}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('Product real-time update received:', payload.eventType, payload);
          
          // Only refresh if it's from another session (not our own changes)
          // Small delay to ensure database consistency
          setTimeout(async () => {
            console.log('Triggering real-time refresh');
            await invalidateAndRefresh();
          }, 200);
        })
        .subscribe((status) => {
          console.log('Products realtime subscription status:', status);
        });
    };

    setupRealtime();
    
    return () => {
      if (channel) {
        console.log('Cleaning up products realtime channel');
        supabase.removeChannel(channel);
      }
    };
  }, [invalidateAndRefresh]);
};
