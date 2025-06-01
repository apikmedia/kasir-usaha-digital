
import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TryPremiumButton from './TryPremiumButton';
import { useSubscription } from "@/hooks/useSubscription";
import { Lock } from "lucide-react";

interface PremiumFeatureWrapperProps {
  children: ReactNode;
  title?: string;
  description?: string;
  fallbackContent?: ReactNode;
}

const PremiumFeatureWrapper = ({ 
  children, 
  title = "Fitur Premium", 
  description = "Upgrade ke premium untuk mengakses fitur ini",
  fallbackContent 
}: PremiumFeatureWrapperProps) => {
  const { subscriptionData, loading } = useSubscription();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Memuat...</div>
        </CardContent>
      </Card>
    );
  }

  if (subscriptionData.has_premium_access) {
    return <>{children}</>;
  }

  if (fallbackContent) {
    return <>{fallbackContent}</>;
  }

  return (
    <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Lock className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <TryPremiumButton />
      </CardContent>
    </Card>
  );
};

export default PremiumFeatureWrapper;
