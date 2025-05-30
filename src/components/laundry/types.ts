
export interface LaundryOrderFormData {
  customer_id: string;
  customer_name: string;
  weight: string;
  service_id: string;
  notes: string;
  pickup_delivery: boolean;
  delivery_address: string;
  delivery_fee: string;
}
