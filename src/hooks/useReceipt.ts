
import { useState } from 'react';

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ReceiptData {
  orderNumber: string;
  businessType: 'laundry' | 'warung' | 'cuci_motor';
  items: ReceiptItem[];
  totalAmount: number;
  paidAmount: number;
  change: number;
  customerName?: string;
  date: string;
  notes?: string;
}

export const useReceipt = () => {
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null);

  const generateReceipt = (
    orderNumber: string,
    businessType: 'laundry' | 'warung' | 'cuci_motor',
    items: ReceiptItem[],
    totalAmount: number,
    paidAmount: number,
    change: number,
    customerName?: string,
    notes?: string
  ): ReceiptData => {
    const receipt: ReceiptData = {
      orderNumber,
      businessType,
      items,
      totalAmount,
      paidAmount,
      change,
      customerName,
      date: new Date().toLocaleString('id-ID'),
      notes
    };

    setCurrentReceipt(receipt);
    return receipt;
  };

  const clearReceipt = () => {
    setCurrentReceipt(null);
  };

  return {
    currentReceipt,
    generateReceipt,
    clearReceipt
  };
};
