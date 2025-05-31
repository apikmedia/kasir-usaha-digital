
import { useOptimizedServices } from './services/useOptimizedServices';
import type { BusinessType, Service } from './services/types';

export type { Service } from './services/types';

export const useServices = (businessType: BusinessType) => {
  return useOptimizedServices(businessType);
};
