
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  business_type: 'laundry' | 'warung' | 'cuci_motor';
  unit?: string;
  estimated_duration?: number;
  is_active: boolean;
  user_id: string;
}

export const useServices = (businessType: 'laundry' | 'warung' | 'cuci_motor') => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, [businessType]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_type', businessType)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data layanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: Omit<Service, 'id' | 'business_type' | 'user_id'>) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "User tidak ditemukan",
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase
        .from('services')
        .insert({
          ...serviceData,
          business_type: businessType,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately for auto-refresh
      setServices(prev => [...prev, data]);
      
      toast({
        title: "Berhasil",
        description: "Layanan berhasil ditambahkan",
      });
      return data;
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan layanan",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    services,
    loading,
    createService,
    refetch: fetchServices
  };
};
