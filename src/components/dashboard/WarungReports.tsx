
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOptimizedOrders } from '@/hooks/useOptimizedOrders';
import { useOptimizedProducts } from '@/hooks/useOptimizedProducts';
import { useMemo } from 'react';
import OptimizedLoader from '@/components/ui/OptimizedLoader';
import PremiumFeatureWrapper from '@/components/subscription/PremiumFeatureWrapper';
import DetailedCharts from '@/components/reports/DetailedCharts';
import ExportButton from '@/components/reports/ExportButton';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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

  const chartData = useMemo(() => {
    // Monthly data for charts
    const monthlyData = orders.reduce((acc, order) => {
      const month = new Date(order.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.revenue += order.total_amount;
        existing.orders += 1;
      } else {
        acc.push({ month, revenue: order.total_amount, orders: 1 });
      }
      return acc;
    }, [] as Array<{ month: string; revenue: number; orders: number }>);

    // Category data (mock for demo)
    const categoryData = [
      { name: 'Makanan', value: orders.length * 0.6, color: '#8B5CF6' },
      { name: 'Minuman', value: orders.length * 0.3, color: '#10B981' },
      { name: 'Snack', value: orders.length * 0.1, color: '#F59E0B' }
    ];

    // Daily trends (last 7 days)
    const dailyTrends = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = orders.filter(o => o.created_at.startsWith(dateStr));
      const revenue = dayOrders.reduce((sum, o) => sum + o.total_amount, 0);
      
      return {
        date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        revenue,
        orders: dayOrders.length
      };
    }).reverse();

    return { monthlyData, categoryData, dailyTrends };
  }, [orders]);

  const handleExportPDF = () => {
    toast({
      title: "Export PDF",
      description: "Fitur export PDF akan segera tersedia",
    });
  };

  const handleExportExcel = () => {
    toast({
      title: "Export Excel", 
      description: "Fitur export Excel akan segera tersedia",
    });
  };

  const isLoading = ordersLoading || productsLoading;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Laporan Harian</CardTitle>
              <CardDescription>Ringkasan penjualan hari ini</CardDescription>
            </div>
            <ExportButton onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
          </div>
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

      <PremiumFeatureWrapper
        title="Analisis Detail"
        description="Lihat grafik dan analisis mendalam dengan fitur premium"
      >
        <DetailedCharts {...chartData} />
      </PremiumFeatureWrapper>
    </div>
  );
};

export default WarungReports;
