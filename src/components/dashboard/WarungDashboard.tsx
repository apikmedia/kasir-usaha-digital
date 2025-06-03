
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Settings, Crown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import WarungCashier from './WarungCashier';
import WarungProductsList from './WarungProductsList';
import WarungOrdersHistory from './WarungOrdersHistory';
import WarungReports from './WarungReports';
import SettingsPage from '../settings/SettingsPage';
import SubscriptionManager from '@/components/subscription/SubscriptionManager';
import MobileNavigation from '../mobile/MobileNavigation';
import PremiumTrialCard from '../premium/PremiumTrialCard';
import PremiumNotificationCenter from '../premium/PremiumNotificationCenter';

const WarungDashboard = () => {
  const [currentTab, setCurrentTab] = useState("cashier");
  const isMobile = useIsMobile();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center space-x-2 mt-12 md:mt-0">
        <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Warung</h1>
      </div>

      <MobileNavigation 
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        businessType="warung"
      />

      {/* Premium Trial Card - Show on cashier tab */}
      {currentTab === "cashier" && (
        <div className="space-y-4">
          <PremiumTrialCard />
          <PremiumNotificationCenter />
        </div>
      )}

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        {!isMobile && (
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="cashier">Kasir</TabsTrigger>
            <TabsTrigger value="products">Kelola Produk</TabsTrigger>
            <TabsTrigger value="orders">Riwayat</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center space-x-1">
              <Crown className="h-4 w-4" />
              <span>Premium</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-1">
              <Settings className="h-4 w-4" />
              <span>Pengaturan</span>
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="cashier" className="space-y-4">
          <WarungCashier />
        </TabsContent>

        <TabsContent value="products">
          <WarungProductsList />
        </TabsContent>

        <TabsContent value="orders">
          <WarungOrdersHistory />
        </TabsContent>

        <TabsContent value="reports">
          <WarungReports />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionManager />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WarungDashboard;
