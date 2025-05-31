
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useCustomers } from '@/hooks/useCustomers';
import LaundryAddCustomerDialog from '@/components/LaundryAddCustomerDialog';
import LaundryEditCustomerDialog from '@/components/LaundryEditCustomerDialog';
import OptimizedLoader from '@/components/ui/OptimizedLoader';

const LaundryCustomersList = () => {
  const { customers, loading, deleteCustomer, error } = useCustomers('laundry');

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pelanggan "${name}"?`)) {
      await deleteCustomer(id);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Gagal memuat data pelanggan. Silakan coba lagi.
          </div>
        </CardContent>
      </Card>
    );
  }

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
        {loading ? (
          <OptimizedLoader type="table" count={5} />
        ) : (
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
              {customers.length === 0 ? (
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
        )}
      </CardContent>
    </Card>
  );
};

export default LaundryCustomersList;
