import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { useServices } from '@/hooks/useServices';
import type { Service } from '@/hooks/services/types';

interface CuciMotorEditServiceDialogProps {
  service: Service;
}

const CuciMotorEditServiceDialog = ({ service }: CuciMotorEditServiceDialogProps) => {
  const { updateService } = useServices('cuci_motor');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: service.name,
    description: service.description || '',
    price: service.price.toString(),
    unit: service.unit || 'unit',
    estimated_duration: service.estimated_duration ? (service.estimated_duration / 60).toString() : ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const serviceData = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        unit: formData.unit,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) * 60 : undefined,
        is_active: true
      };

      const success = await updateService(service.id, serviceData);
      if (success) {
        setOpen(false);
      }
    } catch (error) {
      console.error('Error updating service:', error);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Layanan</DialogTitle>
          <DialogDescription>
            Ubah detail layanan cuci motor
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Layanan *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Cuci Motor Biasa, Cuci + Wax, dll"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Deskripsi layanan"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Harga *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="estimated_duration">Estimasi Waktu (jam)</Label>
              <Input
                id="estimated_duration"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimated_duration}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                placeholder="0.5, 1, 2"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CuciMotorEditServiceDialog;
