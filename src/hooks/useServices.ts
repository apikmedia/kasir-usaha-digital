
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
    
    // Set up real-time subscription
    const channel = supabase
      .channel('services-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `business_type=eq.${businessType}`
        },
        (payload) => {
          console.log('Real-time services update:', payload);
          fetchServices(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessType]);

  const fetchServices = async () => {
    try {
      console.log('Fetching services for:', businessType);
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        toast({
          title: "Error",
          description: "User tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        });
        return;
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
        throw error;
      }
      
      console.log('Fetched services:', data);
      setServices(data || []);
    } catch (error) {
      console.error('Error in fetchServices:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data layanan: " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: Omit<Service, 'id' | 'business_type' | 'user_id'>) => {
    try {
      console.log('Creating service with data:', serviceData);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "User tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        });
        return false;
      }

      const newService = {
        ...serviceData,
        business_type: businessType,
        user_id: user.id
      };

      console.log('Inserting service:', newService);

      const { data, error } = await supabase
        .from('services')
        .insert(newService)
        .select()
        .single();

      if (error) {
        console.error('Error creating service:', error);
        throw error;
      }

      console.log('Service created successfully:', data);
      
      toast({
        title: "Berhasil",
        description: "Layanan berhasil ditambahkan",
      });
      
      // Force immediate refresh
      await fetchServices();
      
      return data;
    } catch (error) {
      console.error('Error in createService:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan layanan: " + (error as Error).message,
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
