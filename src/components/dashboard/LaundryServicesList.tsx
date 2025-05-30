
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useServices } from '@/hooks/useServices';
import LaundryAddServiceDialog from '@/components/LaundryAddServiceDialog';

const LaundryServicesList = () => {
  const { services, loading } = useServices('laundry');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Layanan Tersedia</CardTitle>
          <CardDescription>Daftar layanan laundry</CardDescription>
        </div>
        <LaundryAddServiceDialog />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Memuat data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(service.price)}/{service.unit}
                  </p>
                  {service.estimated_duration && (
                    <p className="text-xs text-gray-500">
                      Estimasi: {Math.round(service.estimated_duration / 60)} jam
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LaundryServicesList;
