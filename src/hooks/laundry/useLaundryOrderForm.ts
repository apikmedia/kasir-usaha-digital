
import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useServices } from '@/hooks/useServices';
import { useToast } from '@/hooks/use-toast';
import { useReceipt } from '@/hooks/useReceipt';
import type { LaundryOrderFormData } from '@/components/laundry/types';

export const useLaundryOrderForm = (onOrderCreated?: () => void) => {
  const { createOrder } = useOrders('laundry');
  const { services } = useServices('laundry');
  const { toast } = useToast();
  const { generateReceipt } = useReceipt();
  
  const [orderData, setOrderData] = useState<LaundryOrderFormData & { payment_status?: string }>({
    customer_id: '',
    customer_name: '',
    weight: '',
    service_id: '',
    notes: '',
    pickup_delivery: false,
    delivery_address: '',
    delivery_fee: '',
    payment_status: 'unpaid'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setOrderData({
      customer_id: '',
      customer_name: '',
      weight: '',
      service_id: '',
      notes: '',
      pickup_delivery: false,
      delivery_address: '',
      delivery_fee: '',
      payment_status: 'unpaid'
    });
  };

  const validateForm = () => {
    if (!orderData.customer_name.trim()) {
      toast({
        title: "Error",
        description: "Nama pelanggan harus diisi",
        variant: "destructive",
      });
      return false;
    }

    if (!orderData.weight || parseFloat(orderData.weight) <= 0) {
      toast({
        title: "Error",
        description: "Berat harus diisi dan lebih dari 0",
        variant: "destructive",
      });
      return false;
    }

    if (!orderData.service_id) {
      toast({
        title: "Error",
        description: "Layanan harus dipilih",
        variant: "destructive",
      });
      return false;
    }

    return true;
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

  const handleCreateOrder = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      console.log('Starting order creation process...');
      console.log('Form data:', orderData);
      
      if (!validateForm()) return;

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

      const orderNotes = [
        `Pelanggan: ${orderData.customer_name.trim()}`,
        `Layanan: ${selectedService.name}`,
        `Berat: ${weightValue}kg`,
        `Harga: Rp ${new Intl.NumberFormat('id-ID').format(baseAmount)}`,
        orderData.notes.trim() && `Catatan: ${orderData.notes.trim()}`,
        orderData.pickup_delivery && `Antar Jemput: ${orderData.delivery_address.trim()}`,
        orderData.pickup_delivery && deliveryFee > 0 && `Biaya Antar: Rp ${new Intl.NumberFormat('id-ID').format(deliveryFee)}`,
        orderData.payment_status === 'paid_upfront' && `Status: Lunas - Bayar di Muka`
      ].filter(Boolean).join(', ');
      
      console.log('Order notes:', orderNotes);

      const orderPayload = {
        customer_id: orderData.customer_id || null,
        total_amount: totalAmount,
        notes: orderNotes,
        status: 'antrian' as const,
        payment_status: orderData.payment_status === 'paid_upfront'
      };
      
      console.log('Final order data:', orderPayload);

      const result = await createOrder(orderPayload);

      if (result) {
        console.log('Order created successfully, generating receipt...');
        
        // Generate and show receipt
        const receiptData = generateReceipt(
          `LDY${Date.now()}`, // Temporary order number
          'laundry',
          [{ 
            name: `${selectedService.name} (${weightValue}kg)`, 
            quantity: 1, 
            price: totalAmount, 
            subtotal: totalAmount 
          }],
          totalAmount,
          orderData.payment_status === 'paid_upfront' ? totalAmount : 0,
          0,
          orderData.customer_name,
          'Pesanan berhasil dibuat'
        );

        // Show receipt in toast or modal
        toast({
          title: "Pesanan Berhasil Dibuat!",
          description: `Nota akan ditampilkan. Total: Rp ${new Intl.NumberFormat('id-ID').format(totalAmount)}`,
        });

        console.log('Receipt generated:', receiptData);
        resetForm();
        
        if (onOrderCreated) {
          onOrderCreated();
        }
        
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
      setOrderData(prev => ({
        ...prev,
        customer_id: customer.id,
        customer_name: customer.name
      }));
    }
  };

  return {
    orderData,
    setOrderData,
    isSubmitting,
    services,
    handleCreateOrder,
    handleCustomerAdded,
    calculateTotal,
    isFormValid
  };
};
