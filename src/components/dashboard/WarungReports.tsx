
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOptimizedOrders } from '@/hooks/useOptimizedOrders';
import { useOptimizedProducts } from '@/hooks/useOptimizedProducts';
import { useMemo } from 'react';
import OptimizedLoader from '@/components/ui/OptimizedLoader';

const StatCardSkeleton = () => (
  <Card>
    <CardContent className="p-4 text-center">
      <OptimizedLoader type="list" count={1} />
    </CardContent>
  </Card>
);

const WarungReports = () => {
  const { orders, loading: ordersLoading } = useOptimizedOrders('warung');
  const { products, loading: productsLoading } = useOptimizedProducts();

  const stats = useMemo(() => {
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

    return {
      todayOrdersCount: todayOrders.length,
      todayRevenue: formatCurrency(todayRevenue),
      totalStock
    };
  }, [orders, products]);

  const isLoading = ordersLoading || productsLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Laporan Harian</CardTitle>
        <CardDescription>Ringkasan penjualan hari ini</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="text-2xl font-bold text-green-600">
                    {stats.todayOrdersCount}
                  </h3>
                  <p className="text-sm text-gray-600">Transaksi Hari Ini</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="text-2xl font-bold text-blue-600">
                    {stats.todayRevenue}
                  </h3>
                  <p className="text-sm text-gray-600">Pendapatan Hari Ini</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="text-2xl font-bold text-purple-600">
                    {stats.totalStock}
                  </h3>
                  <p className="text-sm text-gray-600">Total Stok</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WarungReports;
