
import { ReactNode } from 'react';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';

interface PremiumFeatureGateProps {
  children: ReactNode;
  featureName: string;
  title: string;
  description: string;
}

const PremiumFeatureGate = ({ children, featureName, title, description }: PremiumFeatureGateProps) => {
  const { premiumAccess, startPremiumTrial, loading } = usePremiumFeatures();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (premiumAccess?.has_premium_access) {
    return <>{children}</>;
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Fitur Premium</h3>
          <p className="text-sm text-gray-600 mb-4">
            Akses fitur {featureName} dan fitur premium lainnya dengan trial 30 hari gratis
          </p>
          <Button
            onClick={startPremiumTrial}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Crown className="w-4 h-4 mr-2" />
            Coba Premium Gratis
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          <p>✨ Laporan detail dan analytics</p>
          <p>📊 Export PDF & Excel</p>
          <p>🔄 Backup otomatis</p>
          <p>💳 Integrasi pembayaran Midtrans</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumFeatureGate;
