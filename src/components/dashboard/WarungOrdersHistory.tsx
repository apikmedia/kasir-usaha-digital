
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useOrdersPagination } from '@/hooks/useOrdersPagination';
import PaginationControls from '@/components/ui/PaginationControls';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '@/integrations/supabase/client';

const WarungOrdersHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { 
    orders, 
    totalCount, 
    isLoading, 
    isError,
    refetch
  } = useOrdersPagination({ 
    businessType: 'warung', 
    page: currentPage, 
    pageSize,
    refreshTrigger
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  // Enhanced real-time updates for warung orders with faster response
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Setting up enhanced real-time for warung orders history');

      channel = supabase
        .channel(`warung_orders_history_enhanced_${user.id}_${Date.now()}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id} AND business_type=eq.warung`
        }, (payload) => {
          console.log('Warung order real-time update received:', payload.eventType, payload);
          
          // Immediate refresh without debouncing for faster response
          setRefreshTrigger(prev => prev + 1);
          
          // Also trigger manual refetch for immediate update
          setTimeout(() => {
            refetch();
          }, 100);
        })
        .subscribe((status) => {
          console.log('Enhanced warung orders history realtime subscription status:', status);
        });
    };

    setupRealtime();
    
    return () => {
      if (channel) {
        console.log('Cleaning up warung orders realtime channel');
        supabase.removeChannel(channel);
      }
    };
  }, [refetch]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selesai':
        return <Badge variant="destructive">Selesai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
            Gagal memuat data transaksi. Silakan coba lagi.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>
            Total: {totalCount} transaksi | Halaman {currentPage} dari {totalPages}
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
                  <TableHead>No. Transaksi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Tidak ada transaksi ditemukan
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
                      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString('id-ID')}</TableCell>
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

export default WarungOrdersHistory;
