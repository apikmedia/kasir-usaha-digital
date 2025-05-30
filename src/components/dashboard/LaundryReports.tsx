
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
                {orders.filter(o => o.created_at.startsWith(new Date().toISOString().split('T')[0])).length}
              </h3>
              <p className="text-sm text-gray-600">Pesanan Hari Ini</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'selesai' && o.created_at.startsWith(new Date().toISOString().split('T')[0])).length}
              </h3>
              <p className="text-sm text-gray-600">Selesai Hari Ini</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="text-2xl font-bold text-purple-600">
                {formatCurrency(
                  orders
                    .filter(o => o.created_at.startsWith(new Date().toISOString().split('T')[0]))
                    .reduce((sum, o) => sum + o.total_amount, 0)
                )}
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
