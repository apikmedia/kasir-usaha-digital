
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Product, ProductFormData } from './types';

interface UseProductOperationsProps {
  invalidateAndRefresh: () => void;
}

export const useProductOperations = ({ invalidateAndRefresh }: UseProductOperationsProps) => {
  const { toast } = useToast();

  const createProduct = async (productData: ProductFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Produk berhasil ditambahkan",
      });

      invalidateAndRefresh();
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan produk",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateProduct = async (id: string, productData: Partial<ProductFormData>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Produk berhasil diperbarui",
      });

      invalidateAndRefresh();
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui produk",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Produk berhasil dihapus",
      });

      invalidateAndRefresh();
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus produk",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    return updateProduct(id, { stock: newStock });
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock
  };
};
