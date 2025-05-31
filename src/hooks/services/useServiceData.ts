
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
        return [];
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
      const fetchedServices = data || [];
      setServices(fetchedServices);
      return fetchedServices;
    } catch (error) {
      console.error('Error in fetchServices:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data layanan: " + (error as Error).message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addService = (newService: Service) => {
    console.log('Adding service to state:', newService);
    setServices(prev => {
      const exists = prev.find(s => s.id === newService.id);
      if (exists) {
        console.log('Service already exists, skipping add');
        return prev;
      }
      const updated = [...prev, newService].sort((a, b) => a.name.localeCompare(b.name));
      console.log('Updated services after add:', updated);
      return updated;
    });
  };

  const updateServiceInState = (updatedService: Service) => {
    console.log('Updating service in state:', updatedService);
    setServices(prev => {
      const updated = prev.map(service => 
        service.id === updatedService.id ? updatedService : service
      ).sort((a, b) => a.name.localeCompare(b.name));
      console.log('Updated services after update:', updated);
      return updated;
    });
  };

  const removeService = (serviceId: string) => {
    console.log('Removing service from state:', serviceId);
    setServices(prev => {
      const updated = prev.filter(service => service.id !== serviceId);
      console.log('Updated services after remove:', updated);
      return updated;
    });
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!currentUserId) {
      console.log('No current user, skipping service real-time subscription');
      return;
    }

    console.log('Setting up service real-time subscription for:', businessType, 'user:', currentUserId);

    const channelName = `services-realtime-${businessType}-${currentUserId}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `user_id=eq.${currentUserId}`
        },
        (payload) => {
          console.log('Real-time services update received:', payload);
          
          try {
            if (payload.eventType === 'INSERT') {
              const newServiceData = payload.new as any;
              if (newServiceData && newServiceData.business_type === businessType) {
                console.log('Adding new service to state:', newServiceData);
                addService(newServiceData as Service);
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedServiceData = payload.new as any;
              if (updatedServiceData && updatedServiceData.business_type === businessType) {
                console.log('Updating service in state:', updatedServiceData);
                updateServiceInState(updatedServiceData as Service);
              } else if (updatedServiceData && updatedServiceData.business_type !== businessType) {
                console.log('Removing service from state due to business type change:', updatedServiceData.id);
                removeService(updatedServiceData.id);
              }
            } else if (payload.eventType === 'DELETE') {
              const deletedServiceData = payload.old as any;
              if (deletedServiceData) {
                console.log('Removing service from state:', deletedServiceData.id);
                removeService(deletedServiceData.id);
              }
            }
          } catch (error) {
            console.error('Error handling real-time service update:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Service subscription status:', status);
      });

    return () => {
      console.log('Cleaning up service subscription');
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.error('Error cleaning up service subscription:', error);
      }
    };
  }, [businessType, currentUserId, addService, updateServiceInState, removeService]);

  // Initialize user and fetch services
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Setting current user for services:', user?.id);
        setCurrentUserId(user?.id || null);
      } catch (error) {
        console.error('Error getting user:', error);
      }
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
