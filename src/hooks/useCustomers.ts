
import { useOptimizedCustomers } from './customers/useOptimizedCustomers';
import type { BusinessType } from '@/types/customer';

export { type Customer } from '@/types/customer';

export const useCustomers = (businessType?: BusinessType) => {
  return useOptimizedCustomers(businessType);
};
