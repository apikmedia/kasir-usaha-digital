
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LaundryOrderFormData } from './types';

interface OrderNotesProps {
  orderData: LaundryOrderFormData;
  setOrderData: (data: LaundryOrderFormData) => void;
}

const OrderNotes = ({ orderData, setOrderData }: OrderNotesProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Catatan</Label>
      <Textarea
        id="notes"
        value={orderData.notes}
        onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
        placeholder="Catatan tambahan (opsional)"
      />
    </div>
  );
};

export default OrderNotes;
