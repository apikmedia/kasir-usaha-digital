import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Service, BusinessType } from './types';

interface ServiceCache {
  [key: string]: {
    data: Service[];
    timestamp: number;
  };
}

const CACHE_DURATION = 30000; // 30 seconds

export const useOptimizedServiceData = (businessType: BusinessType) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const cacheRef = useRef<ServiceCache>({});
  const initialLoadRef = useRef(false);

  const getCacheKey = () => `services_${businessType}_${currentUserId}`;

  const getCachedServices = (): Service[] | null => {
    const key = getCacheKey();
    const cached = cacheRef.current[key];
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
      delete cacheRef.current[key];
      return null;
    }
    
    return cached.data;
  };

  const setCachedServices = (data: Service[]) => {
    const key = getCacheKey();
    cacheRef.current[key] = {
      data,
      timestamp: Date.now()
    };
  };

  const fetchServices = async (force = false) => {
    try {
      // Check cache first unless forced
      if (!force && currentUserId) {
        const cachedData = getCachedServices();
        if (cachedData) {
          console.log('Using cached service data');
          setServices(cachedData);
          return cachedData;
        }
      }

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
        .order('name')
        .limit(200); // Limit for performance

      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
      
      console.log('Fetched services:', data);
      const fetchedServices = data || [];
      setServices(fetchedServices);
      setCachedServices(fetchedServices);
      return fetchedServices;
    } catch (error) {
      console.error('Error in fetchServices:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data layanan",
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
      setCachedServices(updated);
      return updated;
    });
  };

  const updateServiceInState = (updatedService: Service) => {
    console.log('Updating service in state:', updatedService);
    setServices(prev => {
      const updated = prev.map(service => 
        service.id === updatedService.id ? updatedService : service
      ).sort((a, b) => a.name.localeCompare(b.name));
      setCachedServices(updated);
      return updated;
    });
  };

  const removeService = (serviceId: string) => {
    console.log('Removing service from state:', serviceId);
    setServices(prev => {
      const updated = prev.filter(service => service.id !== serviceId);
      setCachedServices(updated);
      return updated;
    });
  };

  // Initialize user and fetch services only once
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Setting current user for services:', user?.id);
        setCurrentUserId(user?.id || null);
        
        if (user?.id && !initialLoadRef.current) {
          initialLoadRef.current = true;
          await fetchServices();
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };
    
    if (!initialLoadRef.current) {
      initializeUser();
    }
  }, [businessType]);

  // Simplified real-time subscription
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`services-optimized-${businessType}-${currentUserId}`)
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
          
          if (payload.eventType === 'INSERT') {
            const newServiceData = payload.new as any;
            if (newServiceData && newServiceData.business_type === businessType) {
              addService(newServiceData as Service);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedServiceData = payload.new as any;
            if (updatedServiceData && updatedServiceData.business_type === businessType) {
              updateServiceInState(updatedServiceData as Service);
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedServiceData = payload.old as any;
            if (deletedServiceData) {
              removeService(deletedServiceData.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessType, currentUserId]);

  return {
    services,
    loading,
    currentUserId,
    fetchServices,
    addService,
    updateServiceInState,
    removeService
  };
};
