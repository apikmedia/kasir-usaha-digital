
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Settings, Crown } from "lucide-react";
import WarungCashier from './WarungCashier';
import WarungProductsList from './WarungProductsList';
import WarungOrdersHistory from './WarungOrdersHistory';
import WarungReports from './WarungReports';
import SettingsPage from '../settings/SettingsPage';
import SubscriptionManager from '@/components/subscription/SubscriptionManager';

const WarungDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <ShoppingCart className="h-8 w-8 text-green-500" />
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Warung</h1>
      </div>

      <Tabs defaultValue="cashier" className="space-y-4">
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
