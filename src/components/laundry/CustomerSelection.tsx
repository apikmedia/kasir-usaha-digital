
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LaundryAddCustomerDialog from '@/components/LaundryAddCustomerDialog';
import type { LaundryOrderFormData } from './types';

interface CustomerSelectionProps {
  orderData: LaundryOrderFormData;
  setOrderData: (data: LaundryOrderFormData) => void;
  customers: any[];
  onCustomerAdded: (customer: any) => void;
}

const CustomerSelection = ({ orderData, setOrderData, customers, onCustomerAdded }: CustomerSelectionProps) => {
  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setOrderData({
        ...orderData,
        customer_id: customerId,
        customer_name: customer.name
      });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="customer">Pelanggan</Label>
        <div className="flex space-x-2">
          <Select
            value={orderData.customer_id}
            onValueChange={handleCustomerSelect}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Pilih pelanggan" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} {customer.phone && `- ${customer.phone}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <LaundryAddCustomerDialog 
            triggerVariant="icon" 
            onCustomerAdded={onCustomerAdded}
          />
        </div>
        <Input
          placeholder="Atau ketik nama langsung"
          value={orderData.customer_name}
          onChange={(e) => setOrderData({ ...orderData, customer_name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="weight">Berat (kg)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          min="0.1"
          value={orderData.weight}
          onChange={(e) => setOrderData({ ...orderData, weight: e.target.value })}
          placeholder="0.0"
          required
        />
      </div>
    </div>
  );
};

export default CustomerSelection;
