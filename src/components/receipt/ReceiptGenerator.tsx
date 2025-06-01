
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Printer, Share, MessageCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface ReceiptData {
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

interface ReceiptGeneratorProps {
  receiptData: ReceiptData;
  onPrint?: () => void;
}

const ReceiptGenerator = ({ receiptData, onPrint }: ReceiptGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getBusinessTitle = (type: string) => {
    switch (type) {
      case 'laundry': return 'LAUNDRY';
      case 'warung': return 'WARUNG';
      case 'cuci_motor': return 'CUCI MOTOR';
      default: return 'BISNIS';
    }
  };

  const generateReceiptText = () => {
    const title = getBusinessTitle(receiptData.businessType);
    const separator = "================================";
    
    let receipt = `${title}\n`;
    receipt += `${separator}\n`;
    receipt += `No. Order: ${receiptData.orderNumber}\n`;
    receipt += `Tanggal: ${receiptData.date}\n`;
    if (receiptData.customerName) {
      receipt += `Customer: ${receiptData.customerName}\n`;
    }
    receipt += `${separator}\n`;
    
    receiptData.items.forEach(item => {
      receipt += `${item.name}\n`;
      receipt += `${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.subtotal)}\n`;
    });
    
    receipt += `${separator}\n`;
    receipt += `TOTAL: ${formatCurrency(receiptData.totalAmount)}\n`;
    receipt += `BAYAR: ${formatCurrency(receiptData.paidAmount)}\n`;
    receipt += `KEMBALIAN: ${formatCurrency(receiptData.change)}\n`;
    receipt += `${separator}\n`;
    
    if (receiptData.notes) {
      receipt += `Catatan: ${receiptData.notes}\n`;
      receipt += `${separator}\n`;
    }
    
    receipt += `Terima kasih atas kunjungan Anda!\n`;
    
    return receipt;
  };

  const handlePrint = () => {
    const receiptText = generateReceiptText();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${receiptData.orderNumber}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                line-height: 1.4; 
                margin: 0; 
                padding: 20px;
                white-space: pre-wrap;
              }
              @media print {
                body { margin: 0; padding: 10px; }
              }
            </style>
          </head>
          <body>${receiptText}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    
    if (onPrint) onPrint();
    
    toast({
      title: "Berhasil",
      description: "Nota berhasil dicetak",
    });
  };

  const handleShareWhatsApp = () => {
    const receiptText = generateReceiptText();
    const message = encodeURIComponent(`*NOTA PEMBAYARAN*\n\n${receiptText}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Berhasil",
      description: "Nota berhasil dibagikan ke WhatsApp",
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2"
      >
        <Printer className="h-4 w-4" />
        <span>Nota</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nota Pembayaran</DialogTitle>
            <DialogDescription>
              Cetak atau bagikan nota untuk pesanan {receiptData.orderNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg text-sm font-mono whitespace-pre-wrap">
              {generateReceiptText()}
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handlePrint}
                className="flex-1 flex items-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak</span>
              </Button>
              
              <Button
                onClick={handleShareWhatsApp}
                variant="outline"
                className="flex-1 flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Share WA</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReceiptGenerator;
