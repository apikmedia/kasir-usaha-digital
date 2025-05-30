
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateOrder = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Validasi input
      if (!newOrder.customer_name.trim()) {
        console.error('Nama pelanggan harus diisi');
        return;
      }

      if (!newOrder.weight || parseFloat(newOrder.weight) <= 0) {
        console.error('Berat harus diisi dan lebih dari 0');
        return;
      }

      if (!newOrder.service_id) {
        console.error('Layanan harus dipilih');
        return;
      }

      const selectedService = services.find(s => s.id === newOrder.service_id);
      if (!selectedService) {
        console.error('Layanan tidak ditemukan');
        return;
      }

      const weightValue = parseFloat(newOrder.weight) || 0;
      const baseAmount = selectedService.price * weightValue;
      const deliveryFee = newOrder.pickup_delivery ? (parseFloat(newOrder.delivery_fee) || 0) : 0;
      const totalAmount = baseAmount + deliveryFee;

      // Create order notes
      const orderNotes = [
        `Pelanggan: ${newOrder.customer_name.trim()}`,
        `Layanan: ${selectedService.name}`,
        `Berat: ${weightValue}kg`,
        `Harga: Rp ${new Intl.NumberFormat('id-ID').format(baseAmount)}`,
        newOrder.notes.trim() && `Catatan: ${newOrder.notes.trim()}`,
        newOrder.pickup_delivery && `Antar Jemput: ${newOrder.delivery_address.trim()}`,
        newOrder.pickup_delivery && deliveryFee > 0 && `Biaya Antar: Rp ${new Intl.NumberFormat('id-ID').format(deliveryFee)}`
      ].filter(Boolean).join(', ');
      
      console.log('Creating order with data:', {
        customer_id: newOrder.customer_id || null,
        total_amount: totalAmount,
        notes: orderNotes,
        status: 'antrian'
      });

      const success = await createOrder({
        customer_id: newOrder.customer_id || null,
        total_amount: totalAmount,
        notes: orderNotes,
        status: 'antrian'
      });

      if (success) {
        // Reset form
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
        console.log('Order created successfully');
      }
    } catch (error) {
      console.error('Error in handleCreateOrder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setNewOrder({
        ...newOrder,
        customer_id: customerId,
        customer_name: customer.name
      });
    }
  };

  const handleCustomerAdded = (customer: any) => {
    if (customer && customer.id && customer.name) {
      setNewOrder({
        ...newOrder,
        customer_id: customer.id,
        customer_name: customer.name
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

  const calculateTotal = () => {
    const selectedService = services.find(s => s.id === newOrder.service_id);
    if (!selectedService || !newOrder.weight) return 0;

    const weightValue = parseFloat(newOrder.weight) || 0;
    const baseAmount = selectedService.price * weightValue;
    const deliveryFee = newOrder.pickup_delivery ? (parseFloat(newOrder.delivery_fee) || 0) : 0;
    return baseAmount + deliveryFee;
  };

  const isFormValid = () => {
    return (
      newOrder.customer_name.trim() &&
      newOrder.weight &&
      parseFloat(newOrder.weight) > 0 &&
      newOrder.service_id &&
      !isSubmitting
    );
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
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Berat (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0.1"
              value={newOrder.weight}
              onChange={(e) => setNewOrder({ ...newOrder, weight: e.target.value })}
              placeholder="0.0"
              required
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
            <input
              id="pickup"
              type="checkbox"
              checked={newOrder.pickup_delivery}
              onChange={(e) => setNewOrder({ ...newOrder, pickup_delivery: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="pickup">Aktifkan layanan antar jemput</Label>
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
                min="0"
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

        {calculateTotal() > 0 && (
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-600">
              <p>Total Estimasi: <span className="font-semibold text-lg text-blue-600">{formatCurrency(calculateTotal())}</span></p>
            </div>
          </div>
        )}

        <Button 
          onClick={handleCreateOrder} 
          className="w-full"
          disabled={!isFormValid()}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Membuat Pesanan...' : 'Buat Pesanan'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LaundryNewOrder;
