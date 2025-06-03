
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PremiumAccess {
  has_premium_access: boolean;
  plan: string;
  is_trial: boolean;
  days_remaining: number;
}

export const usePremiumFeatures = () => {
  const [premiumAccess, setPremiumAccess] = useState<PremiumAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkPremiumAccess = async () => {
    try {
      const { data, error } = await supabase.rpc('check_premium_access');
      
      if (error) {
        console.error('Error checking premium access:', error);
        return;
      }
      
      setPremiumAccess(data);
    } catch (error) {
      console.error('Error in checkPremiumAccess:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFeatureAccess = async (featureName: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_premium_feature_access', {
        feature_name: featureName
      });
      
      if (error) {
        console.error('Error checking feature access:', error);
        return false;
      }
      
      return data;
    } catch (error) {
      console.error('Error in checkFeatureAccess:', error);
      return false;
    }
  };

  const startPremiumTrial = async () => {
    try {
      const { data, error } = await supabase.rpc('start_premium_trial');
      
      if (error) {
        console.error('Error starting trial:', error);
        throw error;
      }
      
      if (data.success) {
        toast({
          title: "Trial Premium Aktif!",
          description: data.message,
        });
        checkPremiumAccess(); // Refresh access status
      } else {
        toast({
          title: "Gagal",
          description: data.message,
          variant: "destructive",
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error in startPremiumTrial:', error);
      toast({
        title: "Error",
        description: "Gagal memulai trial premium",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  useEffect(() => {
    checkPremiumAccess();
  }, []);

  return {
    premiumAccess,
    loading,
    checkFeatureAccess,
    startPremiumTrial,
    refetch: checkPremiumAccess
  };
};
