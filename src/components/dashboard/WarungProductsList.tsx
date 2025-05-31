
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useOptimizedProducts } from '@/hooks/useOptimizedProducts';
import WarungAddProductDialog from '@/components/WarungAddProductDialog';
import WarungEditProductDialog from '@/components/WarungEditProductDialog';
import OptimizedLoader from '@/components/ui/OptimizedLoader';

const WarungProductsList = () => {
  const { products, loading, deleteProduct } = useOptimizedProducts();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Habis</Badge>;
    } else if (stock < 10) {
      return <Badge variant="secondary">Sedikit</Badge>;
    } else {
      return <Badge variant="default">Tersedia</Badge>;
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
      await deleteProduct(id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>Kelola produk warung Anda</CardDescription>
        </div>
        <WarungAddProductDialog />
      </CardHeader>
      <CardContent>
        {loading ? (
          <OptimizedLoader type="table" count={5} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Belum ada produk tersedia
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.category || '-'}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{getStockBadge(product.stock)}</TableCell>
                    <TableCell className="text-sm text-gray-500">{product.sku || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <WarungEditProductDialog product={product} />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(product.id, product.name)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default WarungProductsList;
