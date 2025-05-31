
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOptimizedOrders } from '@/hooks/useOptimizedOrders';
import { useOptimizedProducts } from '@/hooks/useOptimizedProducts';
import { useQueryClient } from '@tanstack/react-query';
import WarungCart from './WarungCart';
import WarungProductGrid from './WarungProductGrid';

interface CartItem {
  product: any;
  quantity: number;
}

const WarungCashier = () => {
  const queryClient = useQueryClient();
  const { createOrder } = useOptimizedOrders('warung');
  const { products, loading: productsLoading, updateStock } = useOptimizedProducts();
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: any) => {
    if (product.stock <= 0) return; // Don't add if no stock
    
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      // Check if we can add more (don't exceed stock)
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
      // Update stock for each product
      for (const item of cart) {
        await updateStock(item.product.id, item.product.stock - item.quantity);
      }
      
      // Clear cart
      setCart([]);
      
      // Force immediate refresh of all warung-related queries
      console.log('Force refreshing warung orders after checkout...');
      queryClient.invalidateQueries({ queryKey: ['orders', 'warung'] });
      
      // Also trigger refresh for paginated orders
      queryClient.invalidateQueries({ 
        queryKey: ['orders'],
        predicate: (query) => {
          const queryKey = query.queryKey as any[];
          return queryKey.includes('warung');
        }
      });
    }
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
      </div>
    </div>
  );
};

export default WarungCashier;
