
export interface CartItem {
  product: any;
  quantity: number;
}

export interface CartOperations {
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number, products: any[]) => void;
  clearCart: () => void;
}

export interface CartState {
  cart: CartItem[];
  getTotalAmount: () => number;
}
