
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, CheckCircle } from "lucide-react";
import { useOrders } from '@/hooks/useOrders';

const LaundryOrdersList = () => {
  const { orders, updateOrderStatus } = useOrders('laundry');

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Pesanan</CardTitle>
        <CardDescription>Kelola pesanan laundry Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Pesanan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Catatan</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.order_number}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString('id-ID')}</TableCell>
                <TableCell className="max-w-xs truncate">{order.notes}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {order.status === 'antrian' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateOrderStatus(order.id, 'proses')}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Proses
                      </Button>
                    )}
                    {order.status === 'proses' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'selesai')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Selesai
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LaundryOrdersList;
