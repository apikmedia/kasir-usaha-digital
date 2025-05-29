
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Waves, Clock, CheckCircle, Receipt, Search } from "lucide-react";
import Navbar from '../layout/Navbar';

interface LaundryOrder {
  id: string;
  customerName: string;
  phone: string;
  weight: number;
  serviceType: 'regular' | 'express';
  status: 'proses' | 'selesai';
  price: number;
  createdAt: string;
  estimatedFinish: string;
}

const LaundryDashboard = () => {
  const [orders, setOrders] = useState<LaundryOrder[]>([
    {
      id: '001',
      customerName: 'Bu Sari',
      phone: '08123456789',
      weight: 3.5,
      serviceType: 'regular',
      status: 'proses',
      price: 17500,
      createdAt: '2024-01-15T10:00:00Z',
      estimatedFinish: '2024-01-16T10:00:00Z'
    },
    {
      id: '002',
      customerName: 'Pak Budi',
      phone: '08123456790',
      weight: 2.0,
      serviceType: 'express',
      status: 'selesai',
      price: 16000,
      createdAt: '2024-01-15T08:00:00Z',
      estimatedFinish: '2024-01-15T16:00:00Z'
    }
  ]);

  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    phone: '',
    weight: '',
    serviceType: 'regular' as 'regular' | 'express'
  });

  const prices = {
    regular: 5000, // per kg
    express: 8000  // per kg
  };

  const handleNewOrder = () => {
    if (!newOrder.customerName || !newOrder.weight) return;
    
    const weight = parseFloat(newOrder.weight);
    const price = weight * prices[newOrder.serviceType];
    const estimatedHours = newOrder.serviceType === 'express' ? 8 : 24;
    
    const order: LaundryOrder = {
      id: (orders.length + 1).toString().padStart(3, '0'),
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      weight,
      serviceType: newOrder.serviceType,
      status: 'proses',
      price,
      createdAt: new Date().toISOString(),
      estimatedFinish: new Date(Date.now() + estimatedHours * 60 * 60 * 1000).toISOString()
    };

    setOrders([order, ...orders]);
    setNewOrder({ customerName: '', phone: '', weight: '', serviceType: 'regular' });
    setShowNewOrder(false);
  };

  const updateOrderStatus = (orderId: string, status: 'proses' | 'selesai') => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Stats
  const stats = {
    totalOrders: orders.length,
    ordersInProgress: orders.filter(o => o.status === 'proses').length,
    ordersCompleted: orders.filter(o => o.status === 'selesai').length,
    totalRevenue: orders.filter(o => o.status === 'selesai').reduce((sum, o) => sum + o.price, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100">
      <Navbar businessType="laundry" userName="Admin Laundry" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Laundry</h1>
            <p className="text-gray-600 mt-1">Kelola pesanan dan layanan laundry Anda</p>
          </div>
          <Button 
            onClick={() => setShowNewOrder(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            Pesanan Baru
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Pesanan</CardTitle>
              <Waves className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Sedang Proses</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.ordersInProgress}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Selesai</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.ordersCompleted}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendapatan</CardTitle>
              <Receipt className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="orders">Pesanan Aktif</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {/* Search Bar */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Cari berdasarkan nama pelanggan atau nomor pesanan..."
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">#{order.id}</span>
                          <Badge variant={order.status === 'selesai' ? 'default' : 'secondary'}>
                            {order.status === 'selesai' ? 'Selesai' : 'Proses'}
                          </Badge>
                        </div>
                        <p className="text-gray-900 font-medium">{order.customerName}</p>
                        <p className="text-gray-600 text-sm">{order.phone}</p>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>Berat: {order.weight} kg</span>
                          <span>Layanan: {order.serviceType === 'express' ? 'Express' : 'Regular'}</span>
                          <span className="font-semibold text-green-600">{formatCurrency(order.price)}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Estimasi selesai: {formatDate(order.estimatedFinish)}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {order.status === 'proses' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'selesai')}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Selesai
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Receipt className="h-4 w-4 mr-2" />
                          Cetak Nota
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Riwayat Pesanan</CardTitle>
                <CardDescription>
                  Semua pesanan yang telah selesai
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  Riwayat pesanan akan ditampilkan di sini
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Laporan Laundry</CardTitle>
                <CardDescription>
                  Analisis pendapatan dan performa bisnis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  Laporan akan ditampilkan di sini
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Order Modal */}
      {showNewOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle>Pesanan Baru</CardTitle>
              <CardDescription>
                Tambahkan pesanan laundry baru
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nama Pelanggan</Label>
                <Input
                  id="customerName"
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                  placeholder="Masukkan nama pelanggan"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon (Opsional)</Label>
                <Input
                  id="phone"
                  value={newOrder.phone}
                  onChange={(e) => setNewOrder({...newOrder, phone: e.target.value})}
                  placeholder="08xxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Berat (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={newOrder.weight}
                  onChange={(e) => setNewOrder({...newOrder, weight: e.target.value})}
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">Jenis Layanan</Label>
                <Select value={newOrder.serviceType} onValueChange={(value: 'regular' | 'express') => setNewOrder({...newOrder, serviceType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="regular">Regular - {formatCurrency(prices.regular)}/kg</SelectItem>
                    <SelectItem value="express">Express - {formatCurrency(prices.express)}/kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newOrder.weight && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Total: {formatCurrency(parseFloat(newOrder.weight || '0') * prices[newOrder.serviceType])}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowNewOrder(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleNewOrder}
                  disabled={!newOrder.customerName || !newOrder.weight}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                >
                  Tambah Pesanan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LaundryDashboard;
