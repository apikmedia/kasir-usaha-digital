import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useOrdersPagination } from '@/hooks/useOrdersPagination';
import { useOrderOperations } from '@/hooks/useOrderOperations';
import PaginationControls from '@/components/ui/PaginationControls';
import PaymentDialog from '@/components/payment/PaymentDialog';
import { usePayment } from '@/hooks/usePayment';
import { useReceipt } from '@/hooks/useReceipt';
import LaundryOrdersHeader from '@/components/laundry/LaundryOrdersHeader';
import LaundryOrdersTable from '@/components/laundry/LaundryOrdersTable';
import type { OrderStatus } from '@/types/order';

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

  const handlePayment = (totalAmount: number, orderNumber: string) => {
    openPaymentDialog(totalAmount, orderNumber);
  };

  const handlePaymentComplete = async (paidAmount: number, change: number, paymentMethod: string, orderNumber: string) => {
    const paymentData = processPayment(paidAmount, change);
    
    // Find the order and update payment status
    const order = orders.find(o => o.order_number === orderNumber);
    if (order) {
      await updateStatus(order.id, 'selesai' as OrderStatus);
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

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatus({ orderId, status });
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
        <LaundryOrdersHeader
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          isLoading={isLoading}
        />
        <CardContent>
          <LaundryOrdersTable
            orders={orders}
            isLoading={isLoading}
            isUpdating={isUpdating}
            currentPage={currentPage}
            pageSize={pageSize}
            currentReceipt={currentReceipt}
            onUpdateStatus={handleUpdateStatus}
            onPayment={handlePayment}
          />

          {!isLoading && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
            />
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
