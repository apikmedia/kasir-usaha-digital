
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Waves, Plus, Clock, CheckCircle } from "lucide-react";
import { useOrders } from '@/hooks/useOrders';
import { useServices } from '@/hooks/useServices';

const LaundryDashboard = () => {
  const { orders, loading: ordersLoading, createOrder, updateOrderStatus } = useOrders('laundry');
  const { services, loading: servicesLoading } = useServices('laundry');
  
  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    weight: '',
    service_id: '',
    notes: '',
    service_type: 'regular'
  });

  const handleCreateOrder = async () => {
    const selectedService = services.find(s => s.id === newOrder.service_id);
    if (!selectedService) return;

    const totalAmount = selectedService.price * parseFloat(newOrder.weight || '0');
    
    const success = await createOrder({
      total_amount: totalAmount,
      notes: `Pelanggan: ${newOrder.customer_name}, Berat: ${newOrder.weight}kg, Catatan: ${newOrder.notes}`,
      status: 'antrian'
    });

    if (success) {
      setNewOrder({
        customer_name: '',
        weight: '',
        service_id: '',
        notes: '',
        service_type: 'regular'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'antrian':
        return <Badge variant="secondary">Antrian</Badge>;
      case 'proses':
        return <Badge variant="default">Proses</Badge>;
      case 'selesai':
        return <Badge variant="destructive">Selesai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Waves className="h-8 w-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Laundry</h1>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Pesanan</TabsTrigger>
          <TabsTrigger value="new-order">Pesanan Baru</TabsTrigger>
          <TabsTrigger value="services">Layanan</TabsTrigger>
          <TabsTrigger value="reports">Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pesanan</CardTitle>
              <CardDescription>Kelola pesanan laundry Anda</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-4">Memuat data...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Pesanan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {order.status === 'antrian' && (
                              <Button 
                                size="sm" 
                                onClick={() => updateOrderStatus(order.id, 'proses')}
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Proses
                              </Button>
                            )}
                            {order.status === 'proses' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, 'selesai')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Selesai
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-order" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buat Pesanan Baru</CardTitle>
              <CardDescription>Tambahkan pesanan laundry baru</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Nama Pelanggan</Label>
                  <Input
                    id="customer"
                    value={newOrder.customer_name}
                    onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })}
                    placeholder="Masukkan nama pelanggan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Berat (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={newOrder.weight}
                    onChange={(e) => setNewOrder({ ...newOrder, weight: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service">Layanan</Label>
                <Select
                  value={newOrder.service_id}
                  onValueChange={(value) => setNewOrder({ ...newOrder, service_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih layanan" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - {formatCurrency(service.price)}/{service.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  placeholder="Catatan tambahan (opsional)"
                />
              </div>

              <Button 
                onClick={handleCreateOrder} 
                className="w-full"
                disabled={!newOrder.customer_name || !newOrder.weight || !newOrder.service_id}
              >
                <Plus className="h-4 w-4 mr-2" />
                Buat Pesanan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Layanan Tersedia</CardTitle>
              <CardDescription>Daftar layanan laundry</CardDescription>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="text-center py-4">Memuat data...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <Card key={service.id}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(service.price)}/{service.unit}
                        </p>
                        {service.estimated_duration && (
                          <p className="text-xs text-gray-500">
                            Estimasi: {Math.round(service.estimated_duration / 60)} jam
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LaundryDashboard;
