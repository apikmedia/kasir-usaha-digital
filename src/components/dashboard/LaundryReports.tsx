
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrders } from '@/hooks/useOrders';

const LaundryReports = () => {
  const { orders } = useOrders('laundry');

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Laporan Harian</CardTitle>
        <CardDescription>Ringkasan aktivitas hari ini</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="text-2xl font-bold text-blue-600">
                {todayOrders.length}
              </h3>
              <p className="text-sm text-gray-600">Pesanan Hari Ini</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="text-2xl font-bold text-green-600">
                {completedTodayOrders.length}
              </h3>
              <p className="text-sm text-gray-600">Selesai Hari Ini</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="text-2xl font-bold text-purple-600">
                {formatCurrency(todayRevenue)}
              </h3>
              <p className="text-sm text-gray-600">Pendapatan Hari Ini</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default LaundryReports;
