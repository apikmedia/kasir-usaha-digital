
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreateOrderButtonProps {
  onCreateOrder: () => void;
  isFormValid: boolean;
  isSubmitting: boolean;
}

const CreateOrderButton = ({ onCreateOrder, isFormValid, isSubmitting }: CreateOrderButtonProps) => {
  return (
    <Button 
      onClick={onCreateOrder} 
      className="w-full"
      disabled={!isFormValid}
    >
      <Plus className="h-4 w-4 mr-2" />
      {isSubmitting ? 'Membuat Pesanan...' : 'Buat Pesanan'}
    </Button>
  );
};

export default CreateOrderButton;
