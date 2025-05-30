
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

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

  const addService = (newService: Service) => {
    setServices(prev => [...prev, newService].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const updateServiceInState = (updatedService: Service) => {
    setServices(prev => prev.map(service => 
      service.id === updatedService.id ? updatedService : service
    ).sort((a, b) => a.name.localeCompare(b.name)));
  };

  const removeService = (serviceId: string) => {
    setServices(prev => prev.filter(service => service.id !== serviceId));
  };

  useEffect(() => {
    // Get current user ID first
    const initializeUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    
    initializeUser();
    fetchServices();
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`services-${businessType}-${Date.now()}`)
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
          
          // Only process changes for the current user
          const serviceData = payload.new || payload.old;
          if (serviceData && serviceData.user_id === currentUserId) {
            if (payload.eventType === 'INSERT') {
              const newService = payload.new as Service;
              addService(newService);
            } else if (payload.eventType === 'UPDATE') {
              const updatedService = payload.new as Service;
              updateServiceInState(updatedService);
            } else if (payload.eventType === 'DELETE') {
              const deletedService = payload.old as Service;
              removeService(deletedService.id);
            }
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
  }, [businessType, currentUserId]);

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
      
      // Immediately add to local state for instant UI update
      addService(data);
      
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

  const updateService = async (id: string, serviceData: Partial<Omit<Service, 'id' | 'business_type' | 'user_id'>>) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Immediately update local state
      updateServiceInState(data);

      toast({
        title: "Berhasil",
        description: "Layanan berhasil diperbarui",
      });
      return data;
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui layanan",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Immediately remove from local state
      removeService(id);

      toast({
        title: "Berhasil",
        description: "Layanan berhasil dihapus",
      });
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus layanan",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    refetch: fetchServices
  };
};
