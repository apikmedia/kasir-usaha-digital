
import { useState } from 'react';
import type { CartItem } from './types';

export const useCartState = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  return {
    cart,
    setCart,
    getTotalAmount,
    clearCart
  };
};
