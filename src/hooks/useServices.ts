
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
    
    // Set up real-time subscription with better channel management
    const channel = supabase
      .channel(`services-${businessType}-${Date.now()}`) // Unique channel name
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
          
          // Handle different event types for immediate UI updates
          if (payload.eventType === 'INSERT') {
            const newService = payload.new as Service;
            if (newService.user_id === getCurrentUserId()) {
              setServices(prev => [...prev, newService]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedService = payload.new as Service;
            if (updatedService.user_id === getCurrentUserId()) {
              setServices(prev => prev.map(service => 
                service.id === updatedService.id ? updatedService : service
              ));
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedService = payload.old as Service;
            setServices(prev => prev.filter(service => service.id !== deletedService.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Services subscription status:', status);
      });

    return () => {
      console.log('Cleaning up services subscription');
      supabase.removeChannel(channel);
    };
  }, [businessType]);

  // Helper function to get current user ID
  const getCurrentUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  };

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
      
      // The real-time subscription will handle the UI update automatically
      // But we can also manually add it for immediate feedback
      setServices(prev => [...prev, data]);
      
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
