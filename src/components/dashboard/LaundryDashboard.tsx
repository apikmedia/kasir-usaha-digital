
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Waves } from "lucide-react";
import LaundryOrdersList from './LaundryOrdersList';
import LaundryOrderForm from '../laundry/LaundryOrderForm';
import LaundryServicesList from './LaundryServicesList';
import LaundryCustomersList from './LaundryCustomersList';
import LaundryReports from './LaundryReports';

const LaundryDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Waves className="h-8 w-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Laundry</h1>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="orders">Pesanan</TabsTrigger>
          <TabsTrigger value="customers">Pelanggan</TabsTrigger>
          <TabsTrigger value="services">Layanan</TabsTrigger>
          <TabsTrigger value="reports">Laporan</TabsTrigger>
          <TabsTrigger value="history">Riwayat Transaksi</TabsTrigger>
        </TabsList>

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
