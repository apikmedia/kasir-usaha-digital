
import { useOrderState } from './useOrderState';
import { useOrderOperations } from './useOrderOperations';
import type { Order, BusinessType, OrderStatus } from '@/types/order';

// Re-export the Order interface for backward compatibility
export type { Order } from '@/types/order';

export const useOrders = (businessType: BusinessType) => {
  const {
    orders,
    loading,
    addOrder,
    updateOrderInState,
    refetch
  } = useOrderState(businessType);

  const {
    createOrder: createOrderOperation,
    updateOrderStatus: updateOrderStatusOperation
  } = useOrderOperations();

  const createOrder = async (orderData: Partial<Order>) => {
    const result = await createOrderOperation(businessType, orderData);
    
    if (result.success && result.data) {
      addOrder(result.data);
      return true;
    }
    
    return false;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const result = await updateOrderStatusOperation(orderId, status);
    
    if (result.success && result.updateData) {
      updateOrderInState(orderId, result.updateData);
    }
  };

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    refetch
  };
};
