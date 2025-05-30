
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useOrders } from '@/hooks/useOrders';
import { useServices } from '@/hooks/useServices';
import { useCustomers } from '@/hooks/useCustomers';
import LaundryAddCustomerDialog from '@/components/LaundryAddCustomerDialog';

const LaundryNewOrder = () => {
  const { createOrder } = useOrders('laundry');
  const { services } = useServices('laundry');
  const { customers } = useCustomers();
  
  const [newOrder, setNewOrder] = useState({
    customer_id: '',
    customer_name: '',
    weight: '',
    service_id: '',
    notes: '',
    pickup_delivery: false,
    delivery_address: '',
    delivery_fee: ''
  });

  const handleCreateOrder = async () => {
    const selectedService = services.find(s => s.id === newOrder.service_id);
    if (!selectedService) return;

    const baseAmount = selectedService.price * parseFloat(newOrder.weight || '0');
    const deliveryFee = newOrder.pickup_delivery ? parseFloat(newOrder.delivery_fee || '0') : 0;
    const totalAmount = baseAmount + deliveryFee;

    const orderNotes = [
      `Pelanggan: ${newOrder.customer_name}`,
      `Berat: ${newOrder.weight}kg`,
      newOrder.notes && `Catatan: ${newOrder.notes}`,
      newOrder.pickup_delivery && `Antar Jemput: ${newOrder.delivery_address}`,
      newOrder.pickup_delivery && `Biaya Antar: Rp ${new Intl.NumberFormat('id-ID').format(deliveryFee)}`
    ].filter(Boolean).join(', ');
    
    const success = await createOrder({
      customer_id: newOrder.customer_id || null,
      total_amount: totalAmount,
      notes: orderNotes,
      status: 'antrian'
    });

    if (success) {
      setNewOrder({
        customer_id: '',
        customer_name: '',
        weight: '',
        service_id: '',
        notes: '',
        pickup_delivery: false,
        delivery_address: '',
        delivery_fee: ''
      });
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setNewOrder({
      ...newOrder,
      customer_id: customerId,
      customer_name: customer?.name || ''
    });
  };

  const handleCustomerAdded = (customer: any) => {
    setNewOrder({
      ...newOrder,
      customer_id: customer.id,
      customer_name: customer.name
    });
  };

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
        <CardTitle>Buat Pesanan Baru</CardTitle>
        <CardDescription>Tambahkan pesanan laundry baru</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Pelanggan</Label>
            <div className="flex space-x-2">
              <Select
                value={newOrder.customer_id}
                onValueChange={handleCustomerSelect}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Pilih pelanggan" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} {customer.phone && `- ${customer.phone}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <LaundryAddCustomerDialog 
                triggerVariant="icon" 
                onCustomerAdded={handleCustomerAdded}
              />
            </div>
            <Input
              placeholder="Atau ketik nama langsung"
              value={newOrder.customer_name}
              onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })}
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
          <Label>Antar Jemput</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="pickup"
              type="checkbox"
              checked={newOrder.pickup_delivery}
              onChange={(e) => setNewOrder({ ...newOrder, pickup_delivery: e.target.checked })}
            />
            <Label htmlFor="pickup">Aktifkan</Label>
          </div>
        </div>

        {newOrder.pickup_delivery && (
          <>
            <div className="space-y-2">
              <Label htmlFor="delivery_address">Alamat Antar</Label>
              <Input
                id="delivery_address"
                value={newOrder.delivery_address}
                onChange={(e) => setNewOrder({ ...newOrder, delivery_address: e.target.value })}
                placeholder="Alamat lengkap"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_fee">Biaya Antar</Label>
              <Input
                id="delivery_fee"
                type="number"
                step="1000"
                value={newOrder.delivery_fee}
                onChange={(e) => setNewOrder({ ...newOrder, delivery_fee: e.target.value })}
                placeholder="0"
              />
            </div>
          </>
        )}

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
  );
};

export default LaundryNewOrder;
