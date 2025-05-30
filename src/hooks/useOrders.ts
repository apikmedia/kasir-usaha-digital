
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
    
    // Fix type checking: ensure result is not false and has the expected properties
    if (result && typeof result === 'object' && 'success' in result && result.success && 'data' in result && result.data) {
      addOrder(result.data);
      return true;
    }
    
    return false;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const result = await updateOrderStatusOperation(orderId, status);
    
    // Fix type checking: ensure result is not false and has the expected properties
    if (result && typeof result === 'object' && 'success' in result && result.success && 'updateData' in result && result.updateData) {
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
