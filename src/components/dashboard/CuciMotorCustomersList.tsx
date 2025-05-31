
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useCustomers } from '@/hooks/useCustomers';
import CuciMotorAddCustomerDialog from '@/components/CuciMotorAddCustomerDialog';
import CuciMotorEditCustomerDialog from '@/components/CuciMotorEditCustomerDialog';
import OptimizedLoader from '@/components/ui/OptimizedLoader';
import { useState } from 'react';

const CuciMotorCustomersList = () => {
  const { customers, loading, deleteCustomer, error } = useCustomers('cuci_motor');
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pelanggan "${name}"?`)) {
      console.log('Starting delete operation for customer:', id);
      setDeletingIds(prev => new Set(prev).add(id));
      
      try {
        const success = await deleteCustomer(id);
        if (success) {
          console.log('Delete operation completed successfully');
        } else {
          console.log('Delete operation failed');
        }
      } catch (error) {
        console.error('Error during delete operation:', error);
      } finally {
        setDeletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
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
          <CardDescription>Daftar pelanggan cuci motor</CardDescription>
        </div>
        <CuciMotorAddCustomerDialog />
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
                    Belum ada data pelanggan cuci motor
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} className={deletingIds.has(customer.id) ? 'opacity-50' : ''}>
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
                          disabled={deletingIds.has(customer.id)}
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

export default CuciMotorCustomersList;
