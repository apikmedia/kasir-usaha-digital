
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart } from "lucide-react";
import WarungCashier from './WarungCashier';
import WarungProductsList from './WarungProductsList';
import WarungOrdersHistory from './WarungOrdersHistory';
import WarungReports from './WarungReports';

const WarungDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <ShoppingCart className="h-8 w-8 text-green-500" />
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Warung</h1>
      </div>

      <Tabs defaultValue="cashier" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cashier">Kasir</TabsTrigger>
          <TabsTrigger value="products">Kelola Produk</TabsTrigger>
          <TabsTrigger value="orders">Riwayat</TabsTrigger>
          <TabsTrigger value="reports">Laporan</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default WarungDashboard;
