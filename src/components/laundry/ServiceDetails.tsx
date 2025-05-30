
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LaundryOrderFormData } from './types';
import type { Service } from '@/hooks/useServices';

interface ServiceDetailsProps {
  orderData: LaundryOrderFormData;
  setOrderData: (data: LaundryOrderFormData) => void;
  services: Service[];
}

const ServiceDetails = ({ orderData, setOrderData, services }: ServiceDetailsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="service">Layanan</Label>
      <Select
        value={orderData.service_id}
        onValueChange={(value) => setOrderData({ ...orderData, service_id: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Pilih layanan" />
        </SelectTrigger>
        <SelectContent>
          {services.map((service) => (
            <SelectItem key={service.id} value={service.id}>
              {service.name} - {formatCurrency(service.price)}/{service.unit}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ServiceDetails;
