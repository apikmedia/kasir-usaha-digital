
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Clock } from "lucide-react";
import { LaundryOrderFormData } from './types';

interface LaundryPaymentOptionsProps {
  orderData: LaundryOrderFormData & { payment_status?: string };
  setOrderData: (data: Partial<LaundryOrderFormData & { payment_status?: string }>) => void;
}

const LaundryPaymentOptions = ({ orderData, setOrderData }: LaundryPaymentOptionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Status Pembayaran</span>
        </CardTitle>
        <CardDescription>
          Pilih status pembayaran untuk pesanan laundry
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="payment-status">Status Pembayaran</Label>
          <Select 
            value={orderData.payment_status || 'unpaid'} 
            onValueChange={(value) => setOrderData({ payment_status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih status pembayaran" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="paid_upfront">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-green-500" />
                  <span>Lunas - Bayar di Muka</span>
                </div>
              </SelectItem>
              <SelectItem value="unpaid">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span>Belum Dibayar</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {orderData.payment_status === 'paid_upfront' && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 text-green-800">
              <CreditCard className="h-4 w-4" />
              <span className="font-medium">Pembayaran Lunas</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Customer telah membayar di muka. Pesanan akan ditandai sebagai lunas.
            </p>
          </div>
        )}
        
        {orderData.payment_status === 'unpaid' && (
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2 text-orange-800">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Belum Dibayar</span>
            </div>
            <p className="text-sm text-orange-600 mt-1">
              Pembayaran akan diproses setelah pesanan selesai.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LaundryPaymentOptions;
