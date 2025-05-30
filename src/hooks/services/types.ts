
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  business_type: 'laundry' | 'warung' | 'cuci_motor';
  unit?: string;
  estimated_duration?: number;
  is_active: boolean;
  user_id: string;
}

export type BusinessType = 'laundry' | 'warung' | 'cuci_motor';
