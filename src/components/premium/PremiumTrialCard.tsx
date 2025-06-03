
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Check } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import PremiumBadge from "@/components/subscription/PremiumBadge";

const PremiumTrialCard = () => {
  const { subscriptionData, startPremiumTrial, loading } = useSubscription();

  const premiumFeatures = [
    "Laporan detail dengan grafik interaktif",
    "Export laporan ke PDF dan Excel", 
    "Analisis penjualan mendalam",
    "Backup data otomatis",
    "Integrasi payment gateway Midtrans",
    "Notifikasi real-time",
    "Dukungan prioritas",
    "Data historis unlimited"
  ];

  if (subscriptionData.has_premium_access) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span>Status Premium</span>
            </CardTitle>
            <PremiumBadge 
              plan={subscriptionData.plan}
              is_trial={subscriptionData.is_trial}
              days_remaining={subscriptionData.days_remaining}
            />
          </div>
          <CardDescription>
            {subscriptionData.is_trial 
              ? `Sisa ${subscriptionData.days_remaining} hari trial premium`
              : "Anda memiliki akses premium penuh"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {premiumFeatures.slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Crown className="h-5 w-5 text-purple-600" />
          <span>Coba Premium 30 Hari Gratis</span>
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </CardTitle>
        <CardDescription>
          Nikmati semua fitur premium tanpa biaya selama 30 hari
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <Check className="h-4 w-4 text-purple-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        <Button 
          onClick={startPremiumTrial}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Crown className="h-4 w-4 mr-2" />
          {loading ? "Memproses..." : "Mulai Trial Premium"}
          <Sparkles className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default PremiumTrialCard;
