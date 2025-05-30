
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useOrders } from '@/hooks/useOrders';
import { useServices } from '@/hooks/useServices';
import { useCustomers } from '@/hooks/useCustomers';

const CuciMotorAddOrderDialog = () => {
  const { createOrder } = useOrders('cuci_motor');
  const { services } = useServices('cuci_motor');
  const { customers } = useCustomers('cuci_motor');
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    service_id: '',
    notes: '',
    motor_type: '',
    license_plate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!formData.customer_name.trim()) {
        alert('Nama customer harus diisi');
        return;
      }
      
      if (!formData.motor_type.trim()) {
        alert('Jenis motor harus diisi');
        return;
      }
      
      if (!formData.service_id) {
        alert('Layanan harus dipilih');
        return;
      }
      
      const selectedService = services.find(s => s.id === formData.service_id);
      if (!selectedService) {
        alert('Layanan tidak ditemukan');
        return;
      }

      const orderData = {
        customer_id: formData.customer_id || undefined,
        total_amount: selectedService.price,
        notes: `${formData.motor_type}${formData.license_plate ? ` - ${formData.license_plate}` : ''}${formData.notes ? ` | ${formData.notes}` : ''}`,
        status: 'antrian' as const,
        payment_status: false
      };

      console.log('Creating order with data:', orderData);

      const success = await createOrder(orderData);
      
      if (success) {
        setOpen(false);
        setFormData({
          customer_id: '',
          customer_name: '',
          service_id: '',
          notes: '',
          motor_type: '',
          license_plate: ''
        });
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('Terjadi kesalahan saat membuat pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === formData.customer_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pesanan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Pesanan Cuci Motor</DialogTitle>
          <DialogDescription>
            Buat pesanan cuci motor baru
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customer">Pilih Customer (Opsional)</Label>
            <Select value={formData.customer_id} onValueChange={(value) => {
              const customer = customers.find(c => c.id === value);
              setFormData(prev => ({ 
                ...prev, 
                customer_id: value,
                customer_name: customer?.name || ''
              }));
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih customer atau kosongkan" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="customer_name">Nama Customer *</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
              placeholder={selectedCustomer ? selectedCustomer.name : "Masukkan nama customer"}
              required
            />
          </div>

          <div>
            <Label htmlFor="motor_type">Jenis Motor *</Label>
            <Input
              id="motor_type"
              value={formData.motor_type}
              onChange={(e) => setFormData(prev => ({ ...prev, motor_type: e.target.value }))}
              placeholder="Honda Vario, Yamaha Nmax, dll"
              required
            />
          </div>

          <div>
            <Label htmlFor="license_plate">Plat Nomor</Label>
            <Input
              id="license_plate"
              value={formData.license_plate}
              onChange={(e) => setFormData(prev => ({ ...prev, license_plate: e.target.value }))}
              placeholder="B 1234 ABC"
            />
          </div>

          <div>
            <Label htmlFor="service_id">Pilih Layanan *</Label>
            <Select value={formData.service_id} onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih layanan" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(service.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Catatan khusus untuk pesanan"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Tambah Pesanan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CuciMotorAddOrderDialog;
