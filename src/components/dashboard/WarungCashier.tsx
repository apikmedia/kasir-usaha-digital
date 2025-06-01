
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOptimizedProducts } from '@/hooks/useOptimizedProducts';
import { useReceipt } from '@/hooks/useReceipt';
import WarungCart from './WarungCart';
import WarungProductGrid from './WarungProductGrid';
import PaymentDialog from '@/components/payment/PaymentDialog';
import WarungReceiptDisplay from './WarungReceiptDisplay';
import { useWarungCartHandlers } from './WarungCartHandlers';
import { useWarungCheckoutHandlers } from './WarungCheckoutHandlers';

const WarungCashier = () => {
  const { products, loading: productsLoading } = useOptimizedProducts();
  const { currentReceipt } = useReceipt();
  
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalAmount,
    clearCart
  } = useWarungCartHandlers();

  const {
    paymentDialog,
    handleCheckout,
    handlePaymentComplete,
    closePaymentDialog,
    formatCurrency
  } = useWarungCheckoutHandlers();

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity, products);
  };

  const handleCheckoutClick = () => {
    handleCheckout(cart, getTotalAmount);
  };

  const handlePaymentCompleteClick = (paidAmount: number, change: number, paymentMethod: string, orderNumber: string) => {
    handlePaymentComplete(paidAmount, change, paymentMethod, orderNumber, cart, clearCart);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products for Cashier */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Produk</CardTitle>
            <CardDescription>Pilih produk untuk ditambahkan ke keranjang</CardDescription>
          </CardHeader>
          <CardContent>
            <WarungProductGrid
              products={products}
              loading={productsLoading}
              onAddToCart={addToCart}
              formatCurrency={formatCurrency}
            />
          </CardContent>
        </Card>
      </div>

      {/* Cart */}
      <div>
        <WarungCart
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveFromCart={removeFromCart}
          onCheckout={handleCheckoutClick}
          getTotalAmount={getTotalAmount}
          formatCurrency={formatCurrency}
        />

        {/* Receipt Display */}
        <WarungReceiptDisplay currentReceipt={currentReceipt} />
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={paymentDialog.isOpen}
        onClose={closePaymentDialog}
        totalAmount={paymentDialog.totalAmount}
        orderNumber={paymentDialog.orderNumber}
        onPaymentComplete={handlePaymentCompleteClick}
      />
    </div>
  );
};

export default WarungCashier;
