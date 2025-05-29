
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Car, Clock, CheckCircle, Receipt, Search } from "lucide-react";
import Navbar from '../layout/Navbar';

interface Service {
  id: string;
  name: string;
  price: number;
}

interface BikeOrder {
  id: string;
  customerName: string;
  phone: string;
  bikeType: string;
  plateNumber: string;
  services: Service[];
  status: 'antrian' | 'proses' | 'selesai';
  totalPrice: number;
  createdAt: string;
  estimatedFinish: string;
}

const CuciMotorDashboard = () => {
  const [services] = useState<Service[]>([
    { id: '1', name: 'Cuci Basic', price: 10000 },
    { id: '2', name: 'Cuci Premium', price: 15000 },
    { id: '3', name: 'Semir Body', price: 20000 },
    { id: '4', name: 'Semir Helm', price: 5000 },
    { id: '5', name: 'Cuci Mesin', price: 25000 },
    { id: '6', name: 'Wax', price: 30000 },
  ]);

  const [orders, setOrders] = useState<BikeOrder[]>([
    {
      id: '001',
      customerName: 'Pak Andi',
      phone: '08123456789',
      bikeType: 'Honda Vario',
      plateNumber: 'B 1234 ABC',
      services: [services[0], services[2]],
      status: 'proses',
      totalPrice: 30000,
      createdAt: '2024-01-15T10:00:00Z',
      estimatedFinish: '2024-01-15T11:30:00Z'
    }
  ]);

  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    phone: '',
    bikeType: '',
    plateNumber: '',
    selectedServices: [] as Service[]
  });

  const bikeTypes = [
    'Honda Vario', 'Honda Beat', 'Honda Scoopy', 'Yamaha Nmax', 'Yamaha Mio',
    'Suzuki Address', 'Kawasaki Ninja', 'Vespa', 'Motor Bebek', 'Motor Sport'
  ];

  const handleNewOrder = () => {
    if (!newOrder.customerName || !newOrder.bikeType || newOrder.selectedServices.length === 0) return;
    
    const totalPrice = newOrder.selectedServices.reduce((sum, service) => sum + service.price, 0);
    const estimatedMinutes = newOrder.selectedServices.length * 30; // 30 minutes per service
    
    const order: BikeOrder = {
      id: (orders.length + 1).toString().padStart(3, '0'),
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      bikeType: newOrder.bikeType,
      plateNumber: newOrder.plateNumber,
      services: newOrder.selectedServices,
      status: 'antrian',
      totalPrice,
      createdAt: new Date().toISOString(),
      estimatedFinish: new Date(Date.now() + estimatedMinutes * 60 * 1000).toISOString()
    };

    setOrders([order, ...orders]);
    setNewOrder({
      customerName: '',
      phone: '',
      bikeType: '',
      plateNumber: '',
      selectedServices: []
    });
    setShowNewOrder(false);
  };

  const updateOrderStatus = (orderId: string, status: 'antrian' | 'proses' | 'selesai') => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const toggleService = (service: Service) => {
    const isSelected = newOrder.selectedServices.find(s => s.id === service.id);
    if (isSelected) {
      setNewOrder({
        ...newOrder,
        selectedServices: newOrder.selectedServices.filter(s => s.id !== service.id)
      });
    } else {
      setNewOrder({
        ...newOrder,
        selectedServices: [...newOrder.selectedServices, service]
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'antrian': return 'bg-yellow-100 text-yellow-800';
      case 'proses': return 'bg-blue-100 text-blue-800';
      case 'selesai': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Stats
  const stats = {
    totalOrders: orders.length,
    inQueue: orders.filter(o => o.status === 'antrian').length,
    inProgress: orders.filter(o => o.status === 'proses').length,
    completed: orders.filter(o => o.status === 'selesai').length,
    todayRevenue: orders
      .filter(o => o.status === 'selesai' && new Date(o.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, o) => sum + o.totalPrice, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <Navbar businessType="cuci_motor" userName="Admin Cuci Motor" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Cuci Motor</h1>
            <p className="text-gray-600 mt-1">Kelola layanan cuci dan perawatan motor</p>
          </div>
          <Button 
            onClick={() => setShowNewOrder(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            Order Baru
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Order</CardTitle>
              <Car className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-yellow-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Antrian</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inQueue}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Proses</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Selesai</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendapatan Hari Ini</CardTitle>
              <Receipt className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-indigo-600">{formatCurrency(stats.todayRevenue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="queue">Antrian</TabsTrigger>
            <TabsTrigger value="progress">Sedang Proses</TabsTrigger>
            <TabsTrigger value="completed">Selesai</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-6">
            {/* Search Bar */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Cari berdasarkan nama, nomor plat, atau jenis motor..."
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Queue List */}
            <div className="grid gap-4">
              {orders.filter(order => order.status === 'antrian').map((order) => (
                <Card key={order.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">#{order.id}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status === 'antrian' ? 'Antrian' : order.status}
                          </Badge>
                        </div>
                        <p className="text-gray-900 font-medium">{order.customerName}</p>
                        <p className="text-gray-600 text-sm">{order.phone}</p>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>{order.bikeType}</span>
                          <span>{order.plateNumber}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {order.services.map((service) => (
                            <Badge key={service.id} variant="outline">
                              {service.name}
                            </Badge>
                          ))}
                        </div>
                        <p className="font-semibold text-purple-600">{formatCurrency(order.totalPrice)}</p>
                        <p className="text-xs text-gray-500">
                          Estimasi selesai: {formatDate(order.estimatedFinish)}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => updateOrderStatus(order.id, 'proses')}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Mulai Proses
                        </Button>
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

          <TabsContent value="progress" className="space-y-6">
            <div className="grid gap-4">
              {orders.filter(order => order.status === 'proses').map((order) => (
                <Card key={order.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">#{order.id}</span>
                          <Badge className={getStatusColor(order.status)}>
                            Sedang Proses
                          </Badge>
                        </div>
                        <p className="text-gray-900 font-medium">{order.customerName}</p>
                        <p className="text-gray-600 text-sm">{order.phone}</p>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>{order.bikeType}</span>
                          <span>{order.plateNumber}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {order.services.map((service) => (
                            <Badge key={service.id} variant="outline">
                              {service.name}
                            </Badge>
                          ))}
                        </div>
                        <p className="font-semibold text-purple-600">{formatCurrency(order.totalPrice)}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => updateOrderStatus(order.id, 'selesai')}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Selesai
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <div className="grid gap-4">
              {orders.filter(order => order.status === 'selesai').map((order) => (
                <Card key={order.id} className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">#{order.id}</span>
                          <Badge className={getStatusColor(order.status)}>
                            Selesai
                          </Badge>
                        </div>
                        <p className="text-gray-900 font-medium">{order.customerName}</p>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>{order.bikeType}</span>
                          <span>{order.plateNumber}</span>
                        </div>
                        <p className="font-semibold text-green-600">{formatCurrency(order.totalPrice)}</p>
                        <p className="text-xs text-gray-500">
                          Selesai: {formatDate(order.createdAt)}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Receipt className="h-4 w-4 mr-2" />
                          Cetak Ulang Nota
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Laporan Cuci Motor</CardTitle>
                <CardDescription>
                  Analisis pendapatan dan performa layanan
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
          <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Order Baru</CardTitle>
              <CardDescription>
                Tambahkan order cuci motor baru
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bikeType">Jenis Motor</Label>
                  <Select value={newOrder.bikeType} onValueChange={(value) => setNewOrder({...newOrder, bikeType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis motor" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {bikeTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plateNumber">Nomor Plat (Opsional)</Label>
                  <Input
                    id="plateNumber"
                    value={newOrder.plateNumber}
                    onChange={(e) => setNewOrder({...newOrder, plateNumber: e.target.value})}
                    placeholder="B 1234 ABC"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pilih Layanan</Label>
                <div className="grid grid-cols-2 gap-2">
                  {services.map((service) => (
                    <Button
                      key={service.id}
                      onClick={() => toggleService(service)}
                      variant={newOrder.selectedServices.find(s => s.id === service.id) ? "default" : "outline"}
                      className="h-auto p-3 flex flex-col items-start"
                    >
                      <span className="font-semibold text-sm">{service.name}</span>
                      <span className="text-purple-600 font-bold">{formatCurrency(service.price)}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {newOrder.selectedServices.length > 0 && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800 mb-2">Layanan dipilih:</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newOrder.selectedServices.map((service) => (
                      <Badge key={service.id} variant="secondary">
                        {service.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-purple-800 font-bold">
                    Total: {formatCurrency(newOrder.selectedServices.reduce((sum, s) => sum + s.price, 0))}
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
                  disabled={!newOrder.customerName || !newOrder.bikeType || newOrder.selectedServices.length === 0}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                >
                  Tambah Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CuciMotorDashboard;
