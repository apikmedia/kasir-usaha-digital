
import { Button } from "@/components/ui/button";
import { Crown, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface TryPremiumButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}

const TryPremiumButton = ({ variant = "default", size = "default", className = "" }: TryPremiumButtonProps) => {
  const { subscriptionData, startPremiumTrial, loading } = useSubscription();

  if (subscriptionData.has_premium_access) {
    return null;
  }

  return (
    <Button 
      onClick={startPremiumTrial}
      disabled={loading}
      variant={variant}
      size={size}
      className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white ${className}`}
    >
      <Crown className="h-4 w-4 mr-2" />
      {loading ? "Memproses..." : "Coba Premium 30 Hari"}
      <Sparkles className="h-4 w-4 ml-2" />
    </Button>
  );
};

export default TryPremiumButton;
