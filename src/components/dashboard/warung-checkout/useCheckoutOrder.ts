
import { useOptimizedOrders } from '@/hooks/useOptimizedOrders';

interface CartItem {
  product: any;
  quantity: number;
}

export const useCheckoutOrder = () => {
  const { createOrder } = useOptimizedOrders('warung');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const createCheckoutOrder = async (cart: CartItem[], getTotalAmount: () => number) => {
    if (cart.length === 0) return null;

    const totalAmount = getTotalAmount();
    const orderNotes = cart.map(item => 
      `${item.product.name} x${item.quantity} = ${formatCurrency(item.product.price * item.quantity)}`
    ).join(', ');

    const success = await createOrder({
      total_amount: totalAmount,
      notes: orderNotes,
      status: 'selesai',
      payment_status: true
    });

    if (success) {
      // Generate temporary order number for payment
      const tempOrderNumber = `WRG${Date.now().toString().slice(-6)}`;
      return { success: true, orderNumber: tempOrderNumber, totalAmount };
    }

    return null;
  };

  return {
    createCheckoutOrder
  };
};
