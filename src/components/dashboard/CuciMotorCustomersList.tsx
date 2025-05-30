
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useCustomers } from '@/hooks/useCustomers';
import CuciMotorAddCustomerDialog from '@/components/CuciMotorAddCustomerDialog';
import CuciMotorEditCustomerDialog from '@/components/CuciMotorEditCustomerDialog';

const CuciMotorCustomersList = () => {
  const { customers, loading, deleteCustomer } = useCustomers();

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
          <CardDescription>Daftar pelanggan cuci motor</CardDescription>
        </div>
        <CuciMotorAddCustomerDialog />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Memuat data...</div>
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
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">{customer.address || '-'}</TableCell>
                  <TableCell>{new Date(customer.created_at).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <CuciMotorEditCustomerDialog customer={customer} />
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
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CuciMotorCustomersList;
