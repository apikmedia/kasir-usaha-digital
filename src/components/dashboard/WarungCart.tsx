
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2 } from "lucide-react";

interface CartItem {
  product: any;
  quantity: number;
}

interface WarungCartProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onCheckout: () => void;
  getTotalAmount: () => number;
  formatCurrency: (amount: number) => string;
}

const WarungCart = ({
  cart,
  onUpdateQuantity,
  onRemoveFromCart,
  onCheckout,
  getTotalAmount,
  formatCurrency
}: WarungCartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Keranjang</CardTitle>
        <CardDescription>{cart.length} item</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cart.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Keranjang kosong</p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.product.price)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm w-8 text-center">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRemoveFromCart(item.product.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(getTotalAmount())}
                </span>
              </div>
              <Button 
                onClick={onCheckout} 
                className="w-full mt-4"
                disabled={cart.length === 0}
              >
                Checkout
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WarungCart;
