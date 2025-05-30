
export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  business_type: 'laundry' | 'warung' | 'cuci_motor';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type BusinessType = 'laundry' | 'warung' | 'cuci_motor';
