
import { useInstantOrders } from './useInstantOrders';
import { useOrderOperations } from './useOrderOperations';
import type { Order, BusinessType, OrderStatus } from '@/types/order';

export type { Order } from '@/types/order';

export const useOrders = (businessType: BusinessType) => {
  const {
    orders,
    loading,
    refetch,
    invalidate
  } = useInstantOrders(businessType);

  const {
    createOrder: createOrderOperation,
    updateOrderStatus: updateOrderStatusOperation
  } = useOrderOperations();

  const createOrder = async (orderData: Partial<Order>) => {
    const result = await createOrderOperation(businessType, orderData);
    
    if (result && typeof result === 'object' && 'success' in result && result.success) {
      invalidate();
      return true;
    }
    
    return false;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const result = await updateOrderStatusOperation(orderId, status);
    
    if (result && typeof result === 'object' && 'success' in result && result.success) {
      invalidate();
    }
  };

  return {
    orders,
    loading, // Always false
    createOrder,
    updateOrderStatus,
    refetch
  };
};
