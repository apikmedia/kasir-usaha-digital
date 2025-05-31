
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Clock, Receipt, Loader2 } from "lucide-react";
import { useOptimizedOrders } from '@/hooks/useOptimizedOrders';
import { useOrderOperations } from '@/hooks/useOrderOperations';
import CuciMotorAddOrderDialog from '@/components/CuciMotorAddOrderDialog';
import OptimizedLoader from '@/components/ui/OptimizedLoader';
import { useState } from 'react';
import type { OrderStatus } from '@/types/order';

const CuciMotorOrdersList = () => {
  const { orders, loading: ordersLoading, invalidate } = useOptimizedOrders('cuci_motor');
  const { updateOrderStatus } = useOrderOperations();
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());

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

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrders(prev => new Set(prev).add(orderId));
    try {
      const success = await updateOrderStatus(orderId, status);
      if (success) {
        console.log('Status updated successfully, triggering refresh');
        // Force immediate refresh to show the updated status
        invalidate();
      }
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Pesanan Cuci Motor</CardTitle>
          <CardDescription>
            Total: {orders.length} pesanan
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {ordersLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <CuciMotorAddOrderDialog />
        </div>
      </CardHeader>
      <CardContent>
        {ordersLoading ? (
          <OptimizedLoader type="table" count={5} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
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
                    <TableCell className="font-medium">{index + 1}</TableCell>
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
                            onClick={() => handleUpdateStatus(order.id, 'proses')}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            disabled={updatingOrders.has(order.id)}
                          >
                            {updatingOrders.has(order.id) ? (
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
                            onClick={() => handleUpdateStatus(order.id, 'selesai')}
                            className="bg-green-500 hover:bg-green-600 text-white"
                            disabled={updatingOrders.has(order.id)}
                          >
                            {updatingOrders.has(order.id) ? (
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
        )}
      </CardContent>
    </Card>
  );
};

export default CuciMotorOrdersList;
