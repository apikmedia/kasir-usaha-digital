
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Loader2, CreditCard } from "lucide-react";
import ReceiptGenerator from '@/components/receipt/ReceiptGenerator';
import type { Order, OrderStatus } from '@/types/order';

interface LaundryOrderActionsProps {
  order: Order;
  isUpdating: boolean;
  currentReceipt: any;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onPayment: (totalAmount: number, orderNumber: string) => void;
}

const LaundryOrderActions = ({ 
  order, 
  isUpdating, 
  currentReceipt, 
  onUpdateStatus, 
  onPayment 
}: LaundryOrderActionsProps) => {
  return (
    <div className="flex space-x-2">
      {order.status === 'antrian' && (
        <Button 
          size="sm" 
          onClick={() => onUpdateStatus(order.id, 'siap_ambil' as OrderStatus)}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-1" />
          )}
          Siap Ambil
        </Button>
      )}
      {order.status === 'siap_ambil' && !order.payment_status && (
        <Button 
          size="sm"
          onClick={() => onPayment(order.total_amount, order.order_number)}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <CreditCard className="h-4 w-4 mr-1" />
          Bayar
        </Button>
      )}
      {order.status === 'siap_ambil' && order.payment_status && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onUpdateStatus(order.id, 'belum_bayar' as OrderStatus)}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Clock className="h-4 w-4 mr-1" />
          )}
          Selesai
        </Button>
      )}
      {currentReceipt && currentReceipt.orderNumber === order.order_number && (
        <ReceiptGenerator receiptData={currentReceipt} />
      )}
    </div>
  );
};

export default LaundryOrderActions;
