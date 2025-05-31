
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Clock, Receipt, Loader2 } from "lucide-react";
import { useOrdersPagination } from '@/hooks/useOrdersPagination';
import CuciMotorAddOrderDialog from '@/components/CuciMotorAddOrderDialog';
import PaginationControls from '@/components/ui/PaginationControls';
import { Skeleton } from "@/components/ui/skeleton";

const CuciMotorOrdersList = () => {
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
    businessType: 'cuci_motor', 
    page: currentPage, 
    pageSize 
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'antrian': return 'bg-yellow-100 text-yellow-800';
      case 'proses': return 'bg-blue-100 text-blue-800';
      case 'selesai': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'antrian': return 'Antrian';
      case 'proses': return 'Proses';
      case 'selesai': return 'Selesai';
      default: return status;
    }
  };

  const getSerialNumber = (index: number) => {
    return (currentPage - 1) * pageSize + index + 1;
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Pesanan Cuci Motor</CardTitle>
          <CardDescription>
            Total: {totalCount} pesanan | Halaman {currentPage} dari {totalPages}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <CuciMotorAddOrderDialog />
        </div>
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
                  <TableHead>No. Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Motor</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
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
                      <TableCell>{order.customer_name || '-'}</TableCell>
                      <TableCell>{order.notes || '-'}</TableCell>
                      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {order.status === 'antrian' && (
                            <Button 
                              size="sm"
                              onClick={() => updateOrderStatus({ orderId: order.id, status: 'proses' })}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
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
                              onClick={() => updateOrderStatus({ orderId: order.id, status: 'selesai' })}
                              className="bg-green-500 hover:bg-green-600 text-white"
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
                          <Button variant="outline" size="sm">
                            <Receipt className="h-4 w-4 mr-1" />
                            Cetak
                          </Button>
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
  );
};

export default CuciMotorOrdersList;
