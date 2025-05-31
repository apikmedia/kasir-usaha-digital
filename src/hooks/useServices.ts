
import { useInstantServices } from './services/useInstantServices';
import { useServiceOperations } from './services/useServiceOperations';
import type { BusinessType } from './services/types';

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
    createService: async (...args: any[]) => {
      const result = await createService(...args);
      invalidate();
      return result;
    },
    updateService: async (...args: any[]) => {
      const result = await updateService(...args);
      invalidate();
      return result;
    },
    deleteService,
    refetch
  };
};
