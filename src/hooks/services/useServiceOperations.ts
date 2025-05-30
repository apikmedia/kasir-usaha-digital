
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Service, BusinessType } from './types';

export const useServiceOperations = (
  businessType: BusinessType,
  addService: (service: Service) => void,
  updateServiceInState: (service: Service) => void,
  removeService: (serviceId: string) => void
) => {
  const { toast } = useToast();

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
    createService,
    updateService,
    deleteService
  };
};
