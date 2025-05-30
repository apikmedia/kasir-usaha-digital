
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CheckCircle, Clock, Receipt } from "lucide-react";
import { useOrders } from '@/hooks/useOrders';
import CuciMotorAddOrderDialog from '@/components/CuciMotorAddOrderDialog';

const CuciMotorOrdersList = () => {
  const { orders, loading, updateOrderStatus } = useOrders('cuci_motor');

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Pesanan Cuci Motor</CardTitle>
          <CardDescription>Kelola pesanan cuci motor</CardDescription>
        </div>
        <CuciMotorAddOrderDialog />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Memuat data...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
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
              {orders.map((order) => (
                <TableRow key={order.id}>
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
                          onClick={() => updateOrderStatus(order.id, 'proses')}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Proses
                        </Button>
                      )}
                      {order.status === 'proses' && (
                        <Button 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'selesai')}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
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
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CuciMotorOrdersList;
