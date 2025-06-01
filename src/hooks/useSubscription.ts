
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  has_premium_access: boolean;
  plan: 'basic' | 'premium';
  is_trial: boolean;
  days_remaining: number;
}

export const useSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    has_premium_access: false,
    plan: 'basic',
    is_trial: false,
    days_remaining: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkPremiumAccess = async () => {
    try {
      const { data, error } = await supabase.rpc('check_premium_access');
      
      if (error) {
        console.error('Error checking premium access:', error);
        return;
      }

      setSubscriptionData(data);
    } catch (error) {
      console.error('Error checking premium access:', error);
    } finally {
      setLoading(false);
    }
  };

  const startPremiumTrial = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('start_premium_trial');
      
      if (error) {
        toast({
          title: "Error",
          description: "Gagal memulai trial premium",
          variant: "destructive",
        });
        return false;
      }

      if (data.success) {
        toast({
          title: "Berhasil!",
          description: data.message,
        });
        await checkPremiumAccess();
        return true;
      } else {
        toast({
          title: "Info",
          description: data.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memulai trial",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const revertToBasic = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('revert_to_basic');
      
      if (error) {
        toast({
          title: "Error",
          description: "Gagal kembali ke plan basic",
          variant: "destructive",
        });
        return false;
      }

      if (data.success) {
        toast({
          title: "Berhasil!",
          description: data.message,
        });
        await checkPremiumAccess();
        return true;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPremiumAccess();
  }, []);

  return {
    subscriptionData,
    loading,
    startPremiumTrial,
    revertToBasic,
    checkPremiumAccess
  };
};
