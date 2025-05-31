
import { useOptimizedServiceData } from './services/useOptimizedServiceData';
import { useServiceOperations } from './services/useServiceOperations';
import type { BusinessType } from './services/types';

export type { Service } from './services/types';

export const useServices = (businessType: BusinessType) => {
  const {
    services,
    loading,
    currentUserId,
    fetchServices,
    addService,
    updateServiceInState,
    removeService
  } = useOptimizedServiceData(businessType);

  const {
    createService,
    updateService,
    deleteService
  } = useServiceOperations(
    businessType,
    addService,
    updateServiceInState,
    removeService
  );

  return {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    refetch: () => fetchServices(true)
  };
};
