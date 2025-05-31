
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { useCustomers } from '@/hooks/useCustomers';
import LaundryAddCustomerDialog from '@/components/LaundryAddCustomerDialog';
import LaundryEditCustomerDialog from '@/components/LaundryEditCustomerDialog';

const CustomerSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
    <TableCell>
      <div className="flex space-x-1">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </TableCell>
  </TableRow>
);

const LaundryCustomersList = () => {
  const { customers, loading, deleteCustomer } = useCustomers('laundry');

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pelanggan "${name}"?`)) {
      await deleteCustomer(id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Data Pelanggan</CardTitle>
          <CardDescription>Daftar pelanggan laundry</CardDescription>
        </div>
        <LaundryAddCustomerDialog />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                <CustomerSkeleton />
                <CustomerSkeleton />
                <CustomerSkeleton />
                <CustomerSkeleton />
                <CustomerSkeleton />
              </>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Belum ada data pelanggan laundry
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">{customer.address || '-'}</TableCell>
                  <TableCell>{new Date(customer.created_at).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <LaundryEditCustomerDialog customer={customer} />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(customer.id, customer.name)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LaundryCustomersList;
