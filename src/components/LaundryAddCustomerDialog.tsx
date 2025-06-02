
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users } from "lucide-react";
import { useCustomers } from '@/hooks/useCustomers';

interface LaundryAddCustomerDialogProps {
  triggerVariant?: 'default' | 'icon';
  onCustomerAdded?: (customer: any) => void;
}

const LaundryAddCustomerDialog = ({ triggerVariant = 'default', onCustomerAdded }: LaundryAddCustomerDialogProps) => {
  const { createCustomer } = useCustomers('laundry');
  const [open, setOpen] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerData.name.trim()) {
      return;
    }

    const result = await createCustomer({
      name: customerData.name.trim(),
      phone: customerData.phone.trim() || undefined,
      address: customerData.address.trim() || undefined,
      notes: customerData.notes.trim() || undefined,
      business_type: 'laundry' as const
    });

    if (result) {
      setCustomerData({
        name: '',
        phone: '',
        address: '',
        notes: ''
      });
      setOpen(false);
      
      if (onCustomerAdded) {
        onCustomerAdded(result);
      }
    }
  };

  const TriggerButton = triggerVariant === 'icon' ? (
    <Button size="sm" variant="outline">
      <Plus className="h-4 w-4" />
    </Button>
  ) : (
    <Button>
      <Users className="h-4 w-4 mr-2" />
      Tambah Pelanggan
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
          <DialogDescription>
            Tambahkan data pelanggan laundry baru ke dalam sistem
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
            <Button type="submit" disabled={!customerData.name.trim()}>
              Tambah Pelanggan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LaundryAddCustomerDialog;
