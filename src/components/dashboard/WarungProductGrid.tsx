
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface WarungProductGridProps {
  products: Product[];
  loading: boolean;
  onAddToCart: (product: Product) => void;
  formatCurrency: (amount: number) => string;
}

const WarungProductGrid = ({ products, loading, onAddToCart, formatCurrency }: WarungProductGridProps) => {
  if (loading) {
    return <div className="text-center py-4">Memuat data...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {products.filter(p => p.stock > 0).map((product) => (
        <Card 
          key={product.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onAddToCart(product)}
        >
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm">{product.name}</h3>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-gray-500">Stok: {product.stock}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WarungProductGrid;
