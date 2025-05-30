
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car } from "lucide-react";
import CuciMotorServicesList from './CuciMotorServicesList';
import CuciMotorCustomersList from './CuciMotorCustomersList';
import CuciMotorOrdersList from './CuciMotorOrdersList';
import CuciMotorReports from './CuciMotorReports';

const CuciMotorDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Car className="h-8 w-8 text-purple-500" />
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Cuci Motor</h1>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Pesanan</TabsTrigger>
          <TabsTrigger value="services">Layanan</TabsTrigger>
          <TabsTrigger value="customers">Customer</TabsTrigger>
          <TabsTrigger value="reports">Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <CuciMotorOrdersList />
        </TabsContent>

        <TabsContent value="services">
          <CuciMotorServicesList />
        </TabsContent>

        <TabsContent value="customers">
          <CuciMotorCustomersList />
        </TabsContent>

        <TabsContent value="reports">
          <CuciMotorReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CuciMotorDashboard;
