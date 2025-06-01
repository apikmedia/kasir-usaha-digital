
import { useQueryClient } from '@tanstack/react-query';
import { useOptimizedOrders } from '@/hooks/useOptimizedOrders';
import { useOptimizedProducts } from '@/hooks/useOptimizedProducts';
import { usePayment } from '@/hooks/usePayment';
import { useReceipt } from '@/hooks/useReceipt';

interface CartItem {
  product: any;
  quantity: number;
}

export const useWarungCheckoutHandlers = () => {
  const queryClient = useQueryClient();
  const { createOrder } = useOptimizedOrders('warung');
  const { updateStock } = useOptimizedProducts();
  const { paymentDialog, openPaymentDialog, closePaymentDialog, processPayment } = usePayment();
  const { generateReceipt } = useReceipt();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleCheckout = async (cart: CartItem[], getTotalAmount: () => number) => {
    if (cart.length === 0) return;

    const totalAmount = getTotalAmount();
    const orderNotes = cart.map(item => 
      `${item.product.name} x${item.quantity} = ${formatCurrency(item.product.price * item.quantity)}`
    ).join(', ');

    const success = await createOrder({
      total_amount: totalAmount,
      notes: orderNotes,
      status: 'selesai',
      payment_status: false
    });

    if (success) {
      // Generate temporary order number for payment
      const tempOrderNumber = `WRG${Date.now().toString().slice(-6)}`;
      openPaymentDialog(totalAmount, tempOrderNumber);
    }
  };

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

    closePaymentDialog();
  };

  return {
    paymentDialog,
    handleCheckout,
    handlePaymentComplete,
    closePaymentDialog,
    formatCurrency
  };
};
