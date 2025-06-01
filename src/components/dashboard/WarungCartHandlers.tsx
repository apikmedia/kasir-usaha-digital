
import { useCartState } from './warung-cart/useCartState';
import { useCartOperations } from './warung-cart/useCartOperations';

export const useWarungCartHandlers = () => {
  const { cart, setCart, getTotalAmount, clearCart } = useCartState();
  const { addToCart, removeFromCart, updateQuantity } = useCartOperations({ cart, setCart });

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalAmount,
    clearCart
  };
};
