
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface PaymentData {
  totalAmount: number;
  paidAmount: number;
  change: number;
  orderNumber: string;
  customerName?: string;
}

export const usePayment = () => {
  const { toast } = useToast();
  const [paymentDialog, setPaymentDialog] = useState({
    isOpen: false,
    totalAmount: 0,
    orderNumber: ''
  });

  const openPaymentDialog = (totalAmount: number, orderNumber: string) => {
    setPaymentDialog({
      isOpen: true,
      totalAmount,
      orderNumber
    });
  };

  const closePaymentDialog = () => {
    setPaymentDialog(prev => ({ ...prev, isOpen: false }));
  };

  const processPayment = (paidAmount: number, change: number): PaymentData => {
    const paymentData: PaymentData = {
      totalAmount: paymentDialog.totalAmount,
      paidAmount,
      change,
      orderNumber: paymentDialog.orderNumber
    };

    toast({
      title: "Pembayaran Berhasil",
      description: `Kembalian: ${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(change)}`,
    });

    return paymentData;
  };

  return {
    paymentDialog,
    openPaymentDialog,
    closePaymentDialog,
    processPayment
  };
};
