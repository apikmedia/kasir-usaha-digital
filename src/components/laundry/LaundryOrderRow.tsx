
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import LaundryOrderActions from './LaundryOrderActions';
import type { Order, OrderStatus } from '@/types/order';

interface LaundryOrderRowProps {
  order: Order;
  index: number;
  serialNumber: number;
  isUpdating: boolean;
  currentReceipt: any;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onPayment: (totalAmount: number, orderNumber: string) => void;
}

const LaundryOrderRow = ({ 
  order, 
  index, 
  serialNumber, 
  isUpdating, 
  currentReceipt, 
  onUpdateStatus, 
  onPayment 
}: LaundryOrderRowProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'antrian':
        return <Badge variant="secondary">Antrian</Badge>;
      case 'siap_ambil':
        return <Badge variant="default">Siap Ambil</Badge>;
      case 'belum_bayar':
        return <Badge variant="destructive">Belum Bayar</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (paymentStatus: boolean) => {
    return paymentStatus ? (
      <Badge className="bg-green-100 text-green-800">Lunas</Badge>
    ) : (
      <Badge className="bg-orange-100 text-orange-800">Belum Bayar</Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <TableRow key={order.id}>
      <TableCell className="font-medium">
        {serialNumber}
      </TableCell>
      <TableCell className="font-medium">{order.order_number}</TableCell>
      <TableCell>{getStatusBadge(order.status)}</TableCell>
      <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
      <TableCell>{new Date(order.created_at).toLocaleDateString('id-ID')}</TableCell>
      <TableCell className="max-w-xs truncate">{order.notes}</TableCell>
      <TableCell>
        <LaundryOrderActions
          order={order}
          isUpdating={isUpdating}
          currentReceipt={currentReceipt}
          onUpdateStatus={onUpdateStatus}
          onPayment={onPayment}
        />
      </TableCell>
    </TableRow>
  );
};

export default LaundryOrderRow;
