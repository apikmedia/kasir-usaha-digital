
import { useOptimizedOrders } from './useOptimizedOrders';
import type { BusinessType } from '@/types/order';

export { type Order } from '@/types/order';

export const useOrders = (businessType: BusinessType, options?: {
  dateRange?: { from: Date; to: Date };
  status?: string;
  limit?: number;
}) => {
  return useOptimizedOrders(businessType, options);
};
