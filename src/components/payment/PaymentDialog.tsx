
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, Calculator } from "lucide-react";

interface PaymentDialogProps {
  totalAmount: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentConfirmed: (paidAmount: number, change: number) => void;
  orderNumber?: string;
}

const PaymentDialog = ({ 
  totalAmount, 
  isOpen, 
  onOpenChange, 
  onPaymentConfirmed,
  orderNumber 
}: PaymentDialogProps) => {
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [change, setChange] = useState<number>(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePaidAmountChange = (value: string) => {
    setPaidAmount(value);
    const paid = parseFloat(value) || 0;
    const calculatedChange = paid - totalAmount;
    setChange(calculatedChange >= 0 ? calculatedChange : 0);
  };

  const handleConfirmPayment = () => {
    const paid = parseFloat(paidAmount) || 0;
    if (paid >= totalAmount) {
      onPaymentConfirmed(paid, change);
      setPaidAmount('');
      setChange(0);
      onOpenChange(false);
    }
  };

  const isValidPayment = parseFloat(paidAmount) >= totalAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Pembayaran</span>
          </DialogTitle>
          <DialogDescription>
            {orderNumber && `Pesanan: ${orderNumber}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Tagihan:</span>
              <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="paid-amount">Jumlah Bayar</Label>
            <Input
              id="paid-amount"
              type="number"
              value={paidAmount}
              onChange={(e) => handlePaidAmountChange(e.target.value)}
              placeholder="Masukkan jumlah pembayaran"
              className="text-lg"
            />
          </div>

          {parseFloat(paidAmount) > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span>Kembalian:</span>
                <span className={`text-lg font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(change)}
                </span>
              </div>
              {change < 0 && (
                <p className="text-sm text-red-600 mt-1">
                  Pembayaran kurang {formatCurrency(Math.abs(change))}
                </p>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button 
              onClick={handleConfirmPayment}
              disabled={!isValidPayment}
              className="flex-1"
            >
              <Banknote className="h-4 w-4 mr-2" />
              Konfirmasi Bayar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
