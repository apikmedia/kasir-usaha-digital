
import { useInstantServices } from './services/useInstantServices';
import { useServiceOperations } from './services/useServiceOperations';
import type { BusinessType, Service } from './services/types';

export type { Service } from './services/types';

export const useServices = (businessType: BusinessType) => {
  const {
    services,
    loading,
    refetch,
    invalidate
  } = useInstantServices(businessType);

  const {
    createService,
    updateService,
    deleteService: deleteServiceOp
  } = useServiceOperations(
    businessType,
    () => invalidate(), // Trigger cache invalidation
    () => invalidate(),
    () => invalidate()
  );

  const deleteService = async (id: string) => {
    const result = await deleteServiceOp(id);
    if (result) {
      invalidate();
    }
    return result;
  };

  return {
    services,
    loading, // Always false
    createService: async (serviceData: Omit<Service, 'id' | 'business_type' | 'user_id'>) => {
      const result = await createService(serviceData);
      invalidate();
      return result;
    },
    updateService: async (id: string, serviceData: Partial<Omit<Service, 'id' | 'business_type' | 'user_id'>>) => {
      const result = await updateService(id, serviceData);
      invalidate();
      return result;
    },
    deleteService,
    refetch
  };
};
