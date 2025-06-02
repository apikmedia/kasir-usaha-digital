
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from '@/hooks/useOrders';
import { useMemo } from 'react';
import PremiumFeatureWrapper from '@/components/subscription/PremiumFeatureWrapper';
import DetailedCharts from '@/components/reports/DetailedCharts';
import ExportButton from '@/components/reports/ExportButton';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const stats = useMemo(() => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    };

    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      return orderDate === today;
    });

    // For laundry, completed orders are those with payment_status true or status 'belum_bayar' (completed but not paid)
    const completedTodayOrders = todayOrders.filter(o => o.payment_status || o.status === 'belum_bayar');
    const todayRevenue = completedTodayOrders.reduce((sum, o) => sum + o.total_amount, 0);

    return {
      todayOrdersCount: todayOrders.length,
      completedTodayCount: completedTodayOrders.length,
      todayRevenue: formatCurrency(todayRevenue)
    };
  }, [orders]);

  const chartData = useMemo(() => {
    // For laundry, completed orders are those with payment_status true
    const completedOrders = orders.filter(o => o.payment_status);
    
    const monthlyData = completedOrders
      .reduce((acc, order) => {
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

    const categoryData = [
      { name: 'Cuci Reguler', value: orders.length * 0.7, color: '#3B82F6' },
      { name: 'Cuci Express', value: orders.length * 0.2, color: '#10B981' },
      { name: 'Cuci Premium', value: orders.length * 0.1, color: '#8B5CF6' }
    ];

    const dailyTrends = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = orders.filter(o => o.created_at.startsWith(dateStr) && o.payment_status);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Laporan Harian</CardTitle>
              <CardDescription>Ringkasan aktivitas hari ini</CardDescription>
            </div>
            <ExportButton onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
          </div>
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

      <PremiumFeatureWrapper
        title="Analisis Detail Laundry"
        description="Akses grafik dan analisis mendalam dengan fitur premium"
      >
        <DetailedCharts {...chartData} />
      </PremiumFeatureWrapper>
    </div>
  );
};

export default LaundryReports;
