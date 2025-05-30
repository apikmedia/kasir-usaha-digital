
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { useCustomers, Customer } from '@/hooks/useCustomers';

interface LaundryEditCustomerDialogProps {
  customer: Customer;
}

const LaundryEditCustomerDialog = ({ customer }: LaundryEditCustomerDialogProps) => {
  const { updateCustomer } = useCustomers();
  const [open, setOpen] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: customer.name,
    phone: customer.phone || '',
    email: customer.email || '',
    address: customer.address || '',
    notes: customer.notes || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!customerData.name.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await updateCustomer(customer.id, {
        name: customerData.name.trim(),
        phone: customerData.phone.trim() || undefined,
        email: customerData.email.trim() || undefined,
        address: customerData.address.trim() || undefined,
        notes: customerData.notes.trim() || undefined
      });

      if (result) {
        setOpen(false);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Pelanggan</DialogTitle>
          <DialogDescription>
            Ubah data pelanggan
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Nama Pelanggan <span className="text-red-500">*</span></Label>
            <Input
              id="customer-name"
              value={customerData.name}
              onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
              placeholder="Masukkan nama pelanggan"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer-phone">No. Telepon</Label>
            <Input
              id="customer-phone"
              type="tel"
              value={customerData.phone}
              onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-email">Email</Label>
            <Input
              id="customer-email"
              type="email"
              value={customerData.email}
              onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
              placeholder="email@contoh.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-address">Alamat</Label>
            <Textarea
              id="customer-address"
              value={customerData.address}
              onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
              placeholder="Alamat lengkap pelanggan"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-notes">Catatan</Label>
            <Textarea
              id="customer-notes"
              value={customerData.notes}
              onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
              placeholder="Catatan tambahan (opsional)"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={!customerData.name.trim() || isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LaundryEditCustomerDialog;
