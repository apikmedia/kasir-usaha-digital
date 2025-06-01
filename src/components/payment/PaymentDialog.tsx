
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, CreditCard } from "lucide-react";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  orderNumber: string;
  onPaymentComplete: (paidAmount: number, change: number, paymentMethod: string, orderNumber: string) => void;
}

const PaymentDialog = ({ isOpen, onClose, totalAmount, orderNumber, onPaymentComplete }: PaymentDialogProps) => {
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateChange = () => {
    const paid = parseFloat(paidAmount) || 0;
    return Math.max(0, paid - totalAmount);
  };

  const handleQuickAmount = (amount: number) => {
    setPaidAmount(amount.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paid = parseFloat(paidAmount) || 0;
    
    if (paid < totalAmount && paymentMethod === 'cash') {
      alert('Jumlah pembayaran tidak mencukupi');
      return;
    }

    const change = paymentMethod === 'cash' ? calculateChange() : 0;
    onPaymentComplete(paid, change, paymentMethod, orderNumber);
    
    // Reset form
    setPaidAmount('');
    setPaymentMethod('cash');
  };

  const quickAmounts = [
    totalAmount,
    Math.ceil(totalAmount / 10000) * 10000,
    Math.ceil(totalAmount / 20000) * 20000,
    Math.ceil(totalAmount / 50000) * 50000
  ].filter((amount, index, arr) => arr.indexOf(amount) === index);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Pembayaran</span>
          </DialogTitle>
          <DialogDescription>
            Proses pembayaran untuk pesanan {orderNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Pembayaran:</div>
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(totalAmount)}
            </div>
          </div>

          <div>
            <Label htmlFor="payment-method">Metode Pembayaran</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih metode pembayaran" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="cash">Tunai</SelectItem>
                <SelectItem value="qris">QRIS</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === 'cash' && (
            <>
              <div>
                <Label htmlFor="paid-amount">Jumlah Dibayar</Label>
                <Input
                  id="paid-amount"
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="Masukkan jumlah yang dibayarkan"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(amount)}
                    className="text-sm"
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>

              {paidAmount && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Calculator className="h-4 w-4" />
                    <span className="font-medium">Kembalian:</span>
                  </div>
                  <div className="text-xl font-bold text-blue-900">
                    {formatCurrency(calculateChange())}
                  </div>
                </div>
              )}
            </>
          )}

          {(paymentMethod === 'qris' || paymentMethod === 'transfer') && (
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-green-800 font-medium">
                {paymentMethod === 'qris' ? 'Pembayaran QRIS' : 'Pembayaran Transfer'}
              </div>
              <div className="text-sm text-green-600 mt-1">
                Pastikan pembayaran telah diterima sebelum menyelesaikan transaksi
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={paymentMethod === 'cash' && (!paidAmount || parseFloat(paidAmount) < totalAmount)}
            >
              Proses Pembayaran
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
