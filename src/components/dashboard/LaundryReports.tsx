
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from '@/hooks/useOrders';
import { useMemo } from 'react';

const StatCardSkeleton = () => (
  <Card>
    <CardContent className="p-4 text-center">
      <Skeleton className="h-8 w-16 mx-auto mb-2" />
      <Skeleton className="h-4 w-24 mx-auto" />
    </CardContent>
  </Card>
);

const LaundryReports = () => {
  const { orders, loading } = useOrders('laundry');

  const stats = useMemo(() => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    };

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Filter orders for today
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      return orderDate === today;
    });

    const completedTodayOrders = todayOrders.filter(o => o.status === 'selesai');
    const todayRevenue = completedTodayOrders.reduce((sum, o) => sum + o.total_amount, 0);

    return {
      todayOrdersCount: todayOrders.length,
      completedTodayCount: completedTodayOrders.length,
      todayRevenue: formatCurrency(todayRevenue)
    };
  }, [orders]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Laporan Harian</CardTitle>
        <CardDescription>Ringkasan aktivitas hari ini</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="text-2xl font-bold text-blue-600">
                    {stats.todayOrdersCount}
                  </h3>
                  <p className="text-sm text-gray-600">Pesanan Hari Ini</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="text-2xl font-bold text-green-600">
                    {stats.completedTodayCount}
                  </h3>
                  <p className="text-sm text-gray-600">Selesai Hari Ini</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="text-2xl font-bold text-purple-600">
                    {stats.todayRevenue}
                  </h3>
                  <p className="text-sm text-gray-600">Pendapatan Hari Ini</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LaundryReports;
