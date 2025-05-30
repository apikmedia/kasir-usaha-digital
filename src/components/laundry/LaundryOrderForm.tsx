
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrders } from '@/hooks/useOrders';
import { useServices } from '@/hooks/useServices';
import { useToast } from '@/hooks/use-toast';
import CustomerSelection from './CustomerSelection';
import ServiceDetails from './ServiceDetails';
import DeliveryOptions from './DeliveryOptions';
import OrderNotes from './OrderNotes';
import OrderSummary from './OrderSummary';
import CreateOrderButton from './CreateOrderButton';
import type { LaundryOrderFormData } from './types';

const LaundryOrderForm = () => {
  const { createOrder } = useOrders('laundry');
  const { services } = useServices('laundry');
  const { toast } = useToast();
  
  const [orderData, setOrderData] = useState<LaundryOrderFormData>({
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
      
      console.log('Starting order creation process...');
      console.log('Form data:', orderData);
      
      // Enhanced validation
      if (!orderData.customer_name.trim()) {
        toast({
          title: "Error",
          description: "Nama pelanggan harus diisi",
          variant: "destructive",
        });
        return;
      }

      if (!orderData.weight || parseFloat(orderData.weight) <= 0) {
        toast({
          title: "Error",
          description: "Berat harus diisi dan lebih dari 0",
          variant: "destructive",
        });
        return;
      }

      if (!orderData.service_id) {
        toast({
          title: "Error",
          description: "Layanan harus dipilih",
          variant: "destructive",
        });
        return;
      }

      const selectedService = services.find(s => s.id === orderData.service_id);
      if (!selectedService) {
        toast({
          title: "Error",
          description: "Layanan tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      console.log('Selected service:', selectedService);

      const weightValue = parseFloat(orderData.weight) || 0;
      const baseAmount = selectedService.price * weightValue;
      const deliveryFee = orderData.pickup_delivery ? (parseFloat(orderData.delivery_fee) || 0) : 0;
      const totalAmount = baseAmount + deliveryFee;

      console.log('Calculated amounts:', { baseAmount, deliveryFee, totalAmount });

      // Create comprehensive order notes
      const orderNotes = [
        `Pelanggan: ${orderData.customer_name.trim()}`,
        `Layanan: ${selectedService.name}`,
        `Berat: ${weightValue}kg`,
        `Harga: Rp ${new Intl.NumberFormat('id-ID').format(baseAmount)}`,
        orderData.notes.trim() && `Catatan: ${orderData.notes.trim()}`,
        orderData.pickup_delivery && `Antar Jemput: ${orderData.delivery_address.trim()}`,
        orderData.pickup_delivery && deliveryFee > 0 && `Biaya Antar: Rp ${new Intl.NumberFormat('id-ID').format(deliveryFee)}`
      ].filter(Boolean).join(', ');
      
      console.log('Order notes:', orderNotes);

      const orderPayload = {
        customer_id: orderData.customer_id || null,
        total_amount: totalAmount,
        notes: orderNotes,
        status: 'antrian' as const
      };
      
      console.log('Final order data:', orderPayload);

      const success = await createOrder(orderPayload);

      if (success) {
        console.log('Order created successfully, resetting form...');
        
        // Reset form
        setOrderData({
          customer_id: '',
          customer_name: '',
          weight: '',
          service_id: '',
          notes: '',
          pickup_delivery: false,
          delivery_address: '',
          delivery_fee: ''
        });
        
        console.log('Form reset completed');
      }
    } catch (error) {
      console.error('Unexpected error in handleCreateOrder:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan tidak terduga. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomerAdded = (customer: any) => {
    if (customer && customer.id && customer.name) {
      setOrderData({
        ...orderData,
        customer_id: customer.id,
        customer_name: customer.name
      });
    }
  };

  const calculateTotal = () => {
    const selectedService = services.find(s => s.id === orderData.service_id);
    if (!selectedService || !orderData.weight) return 0;

    const weightValue = parseFloat(orderData.weight) || 0;
    const baseAmount = selectedService.price * weightValue;
    const deliveryFee = orderData.pickup_delivery ? (parseFloat(orderData.delivery_fee) || 0) : 0;
    return baseAmount + deliveryFee;
  };

  const isFormValid = () => {
    return (
      orderData.customer_name.trim() &&
      orderData.weight &&
      parseFloat(orderData.weight) > 0 &&
      orderData.service_id &&
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
        <CustomerSelection
          orderData={orderData}
          setOrderData={setOrderData}
          onCustomerAdded={handleCustomerAdded}
        />
        
        <ServiceDetails
          orderData={orderData}
          setOrderData={setOrderData}
          services={services}
        />

        <DeliveryOptions
          orderData={orderData}
          setOrderData={setOrderData}
        />

        <OrderNotes
          orderData={orderData}
          setOrderData={setOrderData}
        />

        <OrderSummary
          totalAmount={calculateTotal()}
        />

        <CreateOrderButton
          onCreateOrder={handleCreateOrder}
          isFormValid={isFormValid()}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
};

export default LaundryOrderForm;
