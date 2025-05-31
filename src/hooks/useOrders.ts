
import { useOptimizedOrderState } from './useOptimizedOrderState';
import { useOrderOperations } from './useOrderOperations';
import type { Order, BusinessType, OrderStatus } from '@/types/order';

export type { Order } from '@/types/order';

export const useOrders = (businessType: BusinessType) => {
  const {
    orders,
    loading,
    addOrder,
    updateOrderInState,
    refetch
  } = useOptimizedOrderState(businessType);

  const {
    createOrder: createOrderOperation,
    updateOrderStatus: updateOrderStatusOperation
  } = useOrderOperations();

  const createOrder = async (orderData: Partial<Order>) => {
    const result = await createOrderOperation(businessType, orderData);
    
    if (result && typeof result === 'object' && 'success' in result && result.success && 'data' in result && result.data) {
      addOrder(result.data);
      return true;
    }
    
    return false;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const result = await updateOrderStatusOperation(orderId, status);
    
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
