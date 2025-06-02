
export interface Order {
  id: string;
  order_number: string;
  business_type: 'laundry' | 'warung' | 'cuci_motor';
  status: 'antrian' | 'siap_ambil' | 'belum_bayar';
  total_amount: number;
  payment_method?: 'cash' | 'transfer';
  payment_status: boolean;
  notes?: string;
  estimated_finish?: string;
  finished_at?: string;
  created_at: string;
  customer_id?: string;
  customer_name?: string;
  user_id: string;
}

export type BusinessType = 'laundry' | 'warung' | 'cuci_motor';
export type OrderStatus = 'antrian' | 'siap_ambil' | 'belum_bayar';
export type PaymentMethod = 'cash' | 'transfer';
