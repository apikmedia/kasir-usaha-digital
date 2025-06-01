
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, CheckCircle, Loader2, CreditCard } from "lucide-react";
import { useOrdersPagination } from '@/hooks/useOrdersPagination';
import { useOrderOperations } from '@/hooks/useOrderOperations';
import PaginationControls from '@/components/ui/PaginationControls';
import { Skeleton } from "@/components/ui/skeleton";
import PaymentDialog from '@/components/payment/PaymentDialog';
import ReceiptGenerator from '@/components/receipt/ReceiptGenerator';
import { usePayment } from '@/hooks/usePayment';
import { useReceipt } from '@/hooks/useReceipt';

const LaundryOrdersList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { 
    orders, 
    totalCount, 
    isLoading, 
    isError, 
    updateOrderStatus, 
    isUpdating 
  } = useOrdersPagination({ 
    businessType: 'laundry', 
    page: currentPage, 
    pageSize 
  });

  const { updateOrderStatus: updateStatus } = useOrderOperations();
  const { paymentDialog, openPaymentDialog, closePaymentDialog, processPayment } = usePayment();
  const { generateReceipt, currentReceipt } = useReceipt();

  const totalPages = Math.ceil(totalCount / pageSize);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'antrian':
        return <Badge variant="secondary">Antrian</Badge>;
      case 'proses':
        return <Badge variant="default">Proses</Badge>;
      case 'selesai':
        return <Badge variant="destructive">Selesai</Badge>;
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

  const getSerialNumber = (index: number) => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  const handlePayment = (totalAmount: number, orderNumber: string) => {
    openPaymentDialog(totalAmount, orderNumber);
  };

  const handlePaymentComplete = async (paidAmount: number, change: number, paymentMethod: string, orderNumber: string) => {
    const paymentData = processPayment(paidAmount, change);
    
    // Find the order and update payment status
    const order = orders.find(o => o.order_number === orderNumber);
    if (order) {
      await updateStatus(order.id, 'selesai');
    }
    
    // Generate receipt
    const receiptData = generateReceipt(
      orderNumber,
      'laundry',
      [{ name: 'Layanan Laundry', quantity: 1, price: paymentData.totalAmount, subtotal: paymentData.totalAmount }],
      paymentData.totalAmount,
      paymentData.paidAmount,
      paymentData.change,
      paymentData.customerName,
      'Pembayaran berhasil'
    );

    closePaymentDialog();
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Gagal memuat data pesanan. Silakan coba lagi.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Pesanan</CardTitle>
            <CardDescription>
              Total: {totalCount} pesanan | Halaman {currentPage} dari {totalPages}
            </CardDescription>
          </div>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: pageSize }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
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
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {getSerialNumber(index)}
                        </TableCell>
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                        <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell className="max-w-xs truncate">{order.notes}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {order.status === 'antrian' && (
                              <Button 
                                size="sm" 
                                onClick={() => updateOrderStatus({ orderId: order.id, status: 'proses' })}
                                disabled={isUpdating}
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <Clock className="h-4 w-4 mr-1" />
                                )}
                                Proses
                              </Button>
                            )}
                            {order.status === 'proses' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateOrderStatus({ orderId: order.id, status: 'selesai' })}
                                disabled={isUpdating}
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Selesai
                              </Button>
                            )}
                            {order.status === 'selesai' && !order.payment_status && (
                              <Button 
                                size="sm"
                                onClick={() => handlePayment(order.total_amount, order.order_number)}
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Bayar
                              </Button>
                            )}
                            {currentReceipt && currentReceipt.orderNumber === order.order_number && (
                              <ReceiptGenerator receiptData={currentReceipt} />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                isLoading={isLoading}
              />
            </>
          )}
        </CardContent>
      </Card>

      <PaymentDialog
        isOpen={paymentDialog.isOpen}
        onClose={closePaymentDialog}
        totalAmount={paymentDialog.totalAmount}
        orderNumber={paymentDialog.orderNumber}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
};

export default LaundryOrdersList;
