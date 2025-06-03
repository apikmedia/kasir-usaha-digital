
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Waves } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import LaundryOrdersList from './LaundryOrdersList';
import LaundryOrderForm from '../laundry/LaundryOrderForm';
import LaundryServicesList from './LaundryServicesList';
import LaundryCustomersList from './LaundryCustomersList';
import LaundryReports from './LaundryReports';
import MobileNavigation from '../mobile/MobileNavigation';
import PremiumTrialCard from '../premium/PremiumTrialCard';
import PremiumNotificationCenter from '../premium/PremiumNotificationCenter';

const LaundryDashboard = () => {
  const [currentTab, setCurrentTab] = useState("orders");
  const isMobile = useIsMobile();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center space-x-2 mt-12 md:mt-0">
        <Waves className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Laundry</h1>
      </div>

      <MobileNavigation 
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        businessType="laundry"
      />

      {/* Premium Trial Card - Show on orders tab */}
      {currentTab === "orders" && (
        <div className="space-y-4">
          <PremiumTrialCard />
          <PremiumNotificationCenter />
        </div>
      )}

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        {!isMobile && (
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">Pesanan</TabsTrigger>
            <TabsTrigger value="customers">Pelanggan</TabsTrigger>
            <TabsTrigger value="services">Layanan</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
            <TabsTrigger value="history">Riwayat Transaksi</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="orders">
          <LaundryOrdersList />
        </TabsContent>

        <TabsContent value="customers">
          <LaundryCustomersList />
        </TabsContent>

        <TabsContent value="services">
          <LaundryServicesList />
        </TabsContent>

        <TabsContent value="reports">
          <LaundryReports />
        </TabsContent>

        <TabsContent value="history">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Riwayat Transaksi</h3>
            <p className="text-gray-500">Fitur riwayat transaksi akan segera hadir</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LaundryDashboard;
