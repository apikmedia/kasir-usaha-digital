
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { useServices } from '@/hooks/useServices';
import { useCustomers } from '@/hooks/useCustomers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { BusinessType, OrderStatus } from '@/types/order';

const CuciMotorAddOrderDialog = () => {
  const { services } = useServices('cuci_motor');
  const { customers } = useCustomers('cuci_motor');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    service_id: '',
    notes: '',
    motor_type: '',
    license_plate: ''
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!formData.customer_name.trim() || !formData.motor_type.trim() || !formData.service_id) {
        throw new Error('Data tidak lengkap');
      }

      const selectedService = services.find(s => s.id === formData.service_id);
      if (!selectedService) throw new Error('Layanan tidak ditemukan');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak ditemukan');

      console.log('Checking daily limit for user:', user.id);
      
      // Enhanced daily limit check with better error handling
      const { data: limitCheck, error: limitError } = await supabase
        .rpc('check_daily_limit');

      console.log('Daily limit check result:', limitCheck, 'Error:', limitError);

      if (limitError) {
        console.error('Error checking daily limit:', limitError);
        throw new Error(`Error checking limit: ${limitError.message}`);
      }
      
      if (!limitCheck) {
        // Get current transaction count for better error message
        const { data: currentCount } = await supabase
          .from('transactions')
          .select('transaction_count')
          .eq('user_id', user.id)
          .eq('date', new Date().toISOString().split('T')[0])
          .single();
          
        const count = currentCount?.transaction_count || 0;
        throw new Error(`Batas transaksi harian telah tercapai (${count}/20). Upgrade ke Premium untuk transaksi unlimited.`);
      }

      // Generate order number
      const { data: orderNumber, error: orderNumberError } = await supabase
        .rpc('generate_order_number', { business_prefix: 'CMT' });

      if (orderNumberError || !orderNumber) {
        console.error('Error generating order number:', orderNumberError);
        throw new Error('Gagal membuat nomor pesanan');
      }

      console.log('Generated order number:', orderNumber);

      const businessType: BusinessType = 'cuci_motor';
      const orderStatus: OrderStatus = 'antrian';

      const orderData = {
        order_number: orderNumber,
        business_type: businessType,
        user_id: user.id,
        customer_id: formData.customer_id || null,
        total_amount: selectedService.price,
        notes: `${formData.motor_type}${formData.license_plate ? ` - ${formData.license_plate}` : ''}${formData.notes ? ` | ${formData.notes}` : ''}`,
        status: orderStatus,
        payment_status: false
      };

      console.log('Creating order with data:', orderData);

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      console.log('Order created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'cuci_motor'] });
      toast({
        title: "Berhasil",
        description: `Pesanan berhasil dibuat dengan nomor: ${data.order_number}`,
      });
      setOpen(false);
      setFormData({
        customer_id: '',
        customer_name: '',
        service_id: '',
        notes: '',
        motor_type: '',
        license_plate: ''
      });
    },
    onError: (error) => {
      console.error('Error in createOrderMutation:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrderMutation.mutate();
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
            <Button type="submit" disabled={createOrderMutation.isPending}>
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                'Tambah Pesanan'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CuciMotorAddOrderDialog;
