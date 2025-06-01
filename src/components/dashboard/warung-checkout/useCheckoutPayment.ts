
import { useQueryClient } from '@tanstack/react-query';
import { useOptimizedProducts } from '@/hooks/useOptimizedProducts';
import { useReceipt } from '@/hooks/useReceipt';
import { usePayment } from '@/hooks/usePayment';

interface CartItem {
  product: any;
  quantity: number;
}

export const useCheckoutPayment = () => {
  const queryClient = useQueryClient();
  const { updateStock } = useOptimizedProducts();
  const { processPayment } = usePayment();
  const { generateReceipt } = useReceipt();

  const handlePaymentComplete = async (
    paidAmount: number, 
    change: number, 
    paymentMethod: string, 
    orderNumber: string,
    cart: CartItem[],
    clearCart: () => void
  ) => {
    const paymentData = processPayment(paidAmount, change);
    
    // Update stock for each product
    for (const item of cart) {
      await updateStock(item.product.id, item.product.stock - item.quantity);
    }
    
    // Generate receipt
    const receiptItems = cart.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      subtotal: item.product.price * item.quantity
    }));

    generateReceipt(
      paymentData.orderNumber,
      'warung',
      receiptItems,
      paymentData.totalAmount,
      paymentData.paidAmount,
      paymentData.change,
      undefined,
      'Pembelian warung'
    );
    
    // Clear cart
    clearCart();
    
    // Force immediate refresh of all warung-related queries
    console.log('Force refreshing warung orders after checkout...');
    queryClient.invalidateQueries({ queryKey: ['orders', 'warung'] });
    
    queryClient.invalidateQueries({ 
      queryKey: ['orders'],
      predicate: (query) => {
        const queryKey = query.queryKey as any[];
        return queryKey.includes('warung');
      }
    });
  };

  return {
    handlePaymentComplete
  };
};
