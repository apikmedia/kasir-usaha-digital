
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CuciMotorServicesList from './CuciMotorServicesList';
import CuciMotorCustomersList from './CuciMotorCustomersList';
import CuciMotorOrdersList from './CuciMotorOrdersList';
import CuciMotorReports from './CuciMotorReports';

const CuciMotorDashboardTabs = () => {
  return (
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
  );
};

export default CuciMotorDashboardTabs;
