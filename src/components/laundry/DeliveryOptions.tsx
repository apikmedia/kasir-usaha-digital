
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LaundryOrderFormData } from './types';

interface DeliveryOptionsProps {
  orderData: LaundryOrderFormData;
  setOrderData: (data: LaundryOrderFormData) => void;
}

const DeliveryOptions = ({ orderData, setOrderData }: DeliveryOptionsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label>Antar Jemput</Label>
        <div className="flex items-center space-x-2">
          <input
            id="pickup"
            type="checkbox"
            checked={orderData.pickup_delivery}
            onChange={(e) => setOrderData({ ...orderData, pickup_delivery: e.target.checked })}
            className="h-4 w-4"
          />
          <Label htmlFor="pickup">Aktifkan layanan antar jemput</Label>
        </div>
      </div>

      {orderData.pickup_delivery && (
        <>
          <div className="space-y-2">
            <Label htmlFor="delivery_address">Alamat Antar</Label>
            <Input
              id="delivery_address"
              value={orderData.delivery_address}
              onChange={(e) => setOrderData({ ...orderData, delivery_address: e.target.value })}
              placeholder="Alamat lengkap"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery_fee">Biaya Antar</Label>
            <Input
              id="delivery_fee"
              type="number"
              step="1000"
              min="0"
              value={orderData.delivery_fee}
              onChange={(e) => setOrderData({ ...orderData, delivery_fee: e.target.value })}
              placeholder="0"
            />
          </div>
        </>
      )}
    </>
  );
};

export default DeliveryOptions;
