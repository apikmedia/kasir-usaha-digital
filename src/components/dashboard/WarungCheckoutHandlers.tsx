
import { usePayment } from '@/hooks/usePayment';
import { useCheckoutUtils } from './warung-checkout/useCheckoutUtils';
import { useCheckoutOrder } from './warung-checkout/useCheckoutOrder';
import { useCheckoutPayment } from './warung-checkout/useCheckoutPayment';

interface CartItem {
  product: any;
  quantity: number;
}

export const useWarungCheckoutHandlers = () => {
  const { paymentDialog, openPaymentDialog, closePaymentDialog } = usePayment();
  const { formatCurrency } = useCheckoutUtils();
  const { createCheckoutOrder } = useCheckoutOrder();
  const { handlePaymentComplete: processPaymentComplete } = useCheckoutPayment();

  const handleCheckout = async (cart: CartItem[], getTotalAmount: () => number) => {
    const result = await createCheckoutOrder(cart, getTotalAmount);
    if (result) {
      openPaymentDialog(result.totalAmount, result.orderNumber);
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
    await processPaymentComplete(paidAmount, change, paymentMethod, orderNumber, cart, clearCart);
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
