
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";
import { useServices, Service } from '@/hooks/useServices';

interface LaundryEditServiceDialogProps {
  service: Service;
}

const LaundryEditServiceDialog = ({ service }: LaundryEditServiceDialogProps) => {
  const { updateService } = useServices('laundry');
  const [open, setOpen] = useState(false);
  const [serviceData, setServiceData] = useState({
    name: service.name,
    description: service.description || '',
    price: service.price.toString(),
    unit: service.unit || 'kg',
    estimated_duration: service.estimated_duration?.toString() || '180'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!serviceData.name.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await updateService(service.id, {
        name: serviceData.name.trim(),
        description: serviceData.description.trim(),
        price: parseFloat(serviceData.price) || 0,
        unit: serviceData.unit,
        estimated_duration: parseInt(serviceData.estimated_duration) || 180,
        is_active: true
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
          <DialogTitle>Edit Layanan</DialogTitle>
          <DialogDescription>
            Ubah detail layanan laundry
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Layanan</Label>
            <Input
              id="name"
              value={serviceData.name}
              onChange={(e) => setServiceData({ ...serviceData, name: e.target.value })}
              placeholder="Contoh: Cuci Kering"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={serviceData.description}
              onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
              placeholder="Deskripsi layanan (opsional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Harga</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={serviceData.price}
                onChange={(e) => setServiceData({ ...serviceData, price: e.target.value })}
                placeholder="0"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Satuan</Label>
              <Select
                value={serviceData.unit}
                onValueChange={(value) => setServiceData({ ...serviceData, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Per Kg</SelectItem>
                  <SelectItem value="item">Per Item</SelectItem>
                  <SelectItem value="set">Per Set</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Estimasi Durasi (menit)</Label>
            <Select
              value={serviceData.estimated_duration}
              onValueChange={(value) => setServiceData({ ...serviceData, estimated_duration: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">1 Jam</SelectItem>
                <SelectItem value="120">2 Jam</SelectItem>
                <SelectItem value="180">3 Jam</SelectItem>
                <SelectItem value="360">6 Jam</SelectItem>
                <SelectItem value="720">12 Jam</SelectItem>
                <SelectItem value="1440">1 Hari</SelectItem>
                <SelectItem value="2880">2 Hari</SelectItem>
                <SelectItem value="4320">3 Hari</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={!serviceData.name.trim() || !serviceData.price || isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LaundryEditServiceDialog;
