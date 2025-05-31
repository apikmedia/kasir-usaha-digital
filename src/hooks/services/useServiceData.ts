
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Service, BusinessType } from './types';

export const useServiceData = (businessType: BusinessType) => {
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
    console.log('Adding service to state:', newService);
    setServices(prev => [...prev, newService].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const updateServiceInState = (updatedService: Service) => {
    console.log('Updating service in state:', updatedService);
    setServices(prev => prev.map(service => 
      service.id === updatedService.id ? updatedService : service
    ).sort((a, b) => a.name.localeCompare(b.name)));
  };

  const removeService = (serviceId: string) => {
    console.log('Removing service from state:', serviceId);
    setServices(prev => prev.filter(service => service.id !== serviceId));
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!currentUserId) return;

    console.log('Setting up service real-time subscription for:', businessType);

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
          
          if (payload.eventType === 'INSERT') {
            const newServiceData = payload.new as any;
            if (newServiceData && newServiceData.user_id === currentUserId) {
              console.log('Adding new service to state:', newServiceData);
              addService(newServiceData as Service);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedServiceData = payload.new as any;
            if (updatedServiceData && updatedServiceData.user_id === currentUserId) {
              console.log('Updating service in state:', updatedServiceData);
              updateServiceInState(updatedServiceData as Service);
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedServiceData = payload.old as any;
            if (deletedServiceData && deletedServiceData.user_id === currentUserId) {
              console.log('Removing service from state:', deletedServiceData.id);
              removeService(deletedServiceData.id);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Service subscription status:', status);
      });

    return () => {
      console.log('Cleaning up service subscription');
      supabase.removeChannel(channel);
    };
  }, [businessType, currentUserId]);

  useEffect(() => {
    const initializeUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    
    initializeUser();
    fetchServices();
  }, [businessType]);

  return {
    services,
    setServices,
    loading,
    currentUserId,
    fetchServices,
    addService,
    updateServiceInState,
    removeService
  };
};
