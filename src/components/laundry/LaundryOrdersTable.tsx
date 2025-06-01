
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import LaundryOrderRow from './LaundryOrderRow';
import type { Order } from '@/types/order';

interface LaundryOrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  isUpdating: boolean;
  currentPage: number;
  pageSize: number;
  currentReceipt: any;
  onUpdateStatus: (orderId: string, status: string) => void;
  onPayment: (totalAmount: number, orderNumber: string) => void;
}

const LaundryOrdersTable = ({ 
  orders, 
  isLoading, 
  isUpdating, 
  currentPage, 
  pageSize, 
  currentReceipt, 
  onUpdateStatus, 
  onPayment 
}: LaundryOrdersTableProps) => {
  const getSerialNumber = (index: number) => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: pageSize }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">No.</TableHead>
          <TableHead>No. Pesanan</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Pembayaran</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Catatan</TableHead>
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
              Tidak ada pesanan ditemukan
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order, index) => (
            <LaundryOrderRow
              key={order.id}
              order={order}
              index={index}
              serialNumber={getSerialNumber(index)}
              isUpdating={isUpdating}
              currentReceipt={currentReceipt}
              onUpdateStatus={onUpdateStatus}
              onPayment={onPayment}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default LaundryOrdersTable;
