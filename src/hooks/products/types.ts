
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  sku?: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  sku?: string;
  is_active: boolean;
}
