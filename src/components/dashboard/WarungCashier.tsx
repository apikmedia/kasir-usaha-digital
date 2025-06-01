
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOptimizedOrders } from '@/hooks/useOptimizedOrders';
import { useOptimizedProducts } from '@/hooks/useOptimizedProducts';
import { useQueryClient } from '@tanstack/react-query';
import { usePayment } from '@/hooks/usePayment';
import { useReceipt } from '@/hooks/useReceipt';
import WarungCart from './WarungCart';
import WarungProductGrid from './WarungProductGrid';
import PaymentDialog from '@/components/payment/PaymentDialog';
import ReceiptGenerator from '@/components/receipt/ReceiptGenerator';

interface CartItem {
  product: any;
  quantity: number;
}

const WarungCashier = () => {
  const queryClient = useQueryClient();
  const { createOrder } = useOptimizedOrders('warung');
  const { products, loading: productsLoading, updateStock } = useOptimizedProducts();
  const { paymentDialog, openPaymentDialog, closePaymentDialog, processPayment } = usePayment();
  const { currentReceipt, generateReceipt, clearReceipt } = useReceipt();
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: any) => {
    if (product.stock <= 0) return;
    
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      const product = products.find(p => p.id === productId);
      if (product && newQuantity <= product.stock) {
        setCart(cart.map(item =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        ));
      }
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

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
      openPaymentDialog(totalAmount, tempOrderNumber);
    }
  };

  const handlePaymentConfirmed = async (paidAmount: number, change: number) => {
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
    setCart([]);
    
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
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
          onUpdateQuantity={updateQuantity}
          onRemoveFromCart={removeFromCart}
          onCheckout={handleCheckout}
          getTotalAmount={getTotalAmount}
          formatCurrency={formatCurrency}
        />

        {/* Receipt Display */}
        {currentReceipt && (
          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Nota Terakhir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{currentReceipt.orderNumber}</span>
                  <div className="flex space-x-2">
                    <ReceiptGenerator 
                      receiptData={currentReceipt}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        totalAmount={paymentDialog.totalAmount}
        isOpen={paymentDialog.isOpen}
        onOpenChange={closePaymentDialog}
        onPaymentConfirmed={handlePaymentConfirmed}
        orderNumber={paymentDialog.orderNumber}
      />
    </div>
  );
};

export default WarungCashier;
