
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import PremiumBadge from './PremiumBadge';
import TryPremiumButton from './TryPremiumButton';
import { ArrowLeft } from "lucide-react";

const SubscriptionManager = () => {
  const { subscriptionData, revertToBasic, loading } = useSubscription();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Status Langganan</span>
          <PremiumBadge 
            plan={subscriptionData.plan}
            is_trial={subscriptionData.is_trial}
            days_remaining={subscriptionData.days_remaining}
          />
        </CardTitle>
        <CardDescription>
          Kelola langganan dan akses fitur premium
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscriptionData.has_premium_access ? (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
              <h3 className="font-semibold text-purple-800 mb-2">
                {subscriptionData.is_trial ? "Trial Premium Aktif" : "Premium Aktif"}
              </h3>
              <p className="text-sm text-purple-600">
                {subscriptionData.is_trial 
                  ? `Sisa ${subscriptionData.days_remaining} hari untuk mencoba fitur premium`
                  : "Anda memiliki akses ke semua fitur premium"
                }
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Fitur yang Tersedia:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Laporan detail dengan grafik</li>
                <li>• Export laporan ke PDF dan Excel</li>
                <li>• Analisis mendalam</li>
                <li>• Data historis lengkap</li>
              </ul>
            </div>

            {subscriptionData.is_trial && (
              <Button 
                onClick={revertToBasic}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {loading ? "Memproses..." : "Kembali ke Basic"}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-2">Plan Basic</h3>
              <p className="text-sm text-gray-600">
                Akses fitur dasar untuk mengelola bisnis Anda
              </p>
            </div>
            
            <TryPremiumButton className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManager;
