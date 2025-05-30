
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';

const WarungReports = () => {
  const { orders } = useOrders('warung');
  const { products } = useProducts();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const todayDate = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.created_at.startsWith(todayDate));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Laporan Harian</CardTitle>
        <CardDescription>Ringkasan penjualan hari ini</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="text-2xl font-bold text-green-600">
                {todayOrders.length}
              </h3>
              <p className="text-sm text-gray-600">Transaksi Hari Ini</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="text-2xl font-bold text-blue-600">
                {formatCurrency(todayRevenue)}
              </h3>
              <p className="text-sm text-gray-600">Pendapatan Hari Ini</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="text-2xl font-bold text-purple-600">
                {totalStock}
              </h3>
              <p className="text-sm text-gray-600">Total Stok</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default WarungReports;
