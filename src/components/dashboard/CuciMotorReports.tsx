
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useOptimizedOrders } from '@/hooks/useOptimizedOrders';
import { useOptimizedServices } from '@/hooks/services/useOptimizedServices';
import { useOptimizedCustomers } from '@/hooks/customers/useOptimizedCustomers';
import OptimizedLoader from '@/components/ui/OptimizedLoader';

const CuciMotorReports = () => {
  const { orders, loading: ordersLoading } = useOptimizedOrders('cuci_motor');
  const { services, loading: servicesLoading } = useOptimizedServices('cuci_motor');
  const { customers, loading: customersLoading } = useOptimizedCustomers('cuci_motor');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const isLoading = ordersLoading || servicesLoading || customersLoading;

  // Calculate stats
  const stats = {
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === 'selesai').length,
    totalRevenue: orders.filter(o => o.status === 'selesai').reduce((sum, o) => sum + o.total_amount, 0),
    avgOrderValue: orders.filter(o => o.status === 'selesai').length > 0 
      ? orders.filter(o => o.status === 'selesai').reduce((sum, o) => sum + o.total_amount, 0) / orders.filter(o => o.status === 'selesai').length 
      : 0
  };

  // Revenue by month data
  const monthlyData = orders
    .filter(o => o.status === 'selesai')
    .reduce((acc, order) => {
      const month = new Date(order.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.revenue += order.total_amount;
      } else {
        acc.push({ month, revenue: order.total_amount });
      }
      return acc;
    }, [] as Array<{ month: string; revenue: number }>);

  // Order status data for pie chart
  const statusData = [
    { name: 'Antrian', value: orders.filter(o => o.status === 'antrian').length, color: '#FEF3C7' },
    { name: 'Proses', value: orders.filter(o => o.status === 'proses').length, color: '#DBEAFE' },
    { name: 'Selesai', value: orders.filter(o => o.status === 'selesai').length, color: '#D1FAE5' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <OptimizedLoader type="list" count={1} />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <OptimizedLoader type="list" count={3} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Nilai Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pendapatan Bulanan</CardTitle>
            <CardDescription>Grafik pendapatan per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Pesanan</CardTitle>
            <CardDescription>Distribusi status pesanan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Service and Customer Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Statistik Layanan</CardTitle>
            <CardDescription>Informasi layanan cuci motor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Layanan:</span>
                <span className="font-semibold">{services.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Layanan Aktif:</span>
                <span className="font-semibold">{services.filter(s => s.is_active).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Harga Terendah:</span>
                <span className="font-semibold">
                  {services.length > 0 ? formatCurrency(Math.min(...services.map(s => s.price))) : formatCurrency(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Harga Tertinggi:</span>
                <span className="font-semibold">
                  {services.length > 0 ? formatCurrency(Math.max(...services.map(s => s.price))) : formatCurrency(0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistik Customer</CardTitle>
            <CardDescription>Informasi data pelanggan cuci motor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Customer:</span>
                <span className="font-semibold">{customers.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer dengan Email:</span>
                <span className="font-semibold">{customers.filter(c => c.email).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer dengan Telepon:</span>
                <span className="font-semibold">{customers.filter(c => c.phone).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CuciMotorReports;
