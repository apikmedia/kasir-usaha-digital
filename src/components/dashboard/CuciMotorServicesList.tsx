
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useOptimizedServices } from '@/hooks/services/useOptimizedServices';
import CuciMotorAddServiceDialog from '@/components/CuciMotorAddServiceDialog';
import CuciMotorEditServiceDialog from '@/components/CuciMotorEditServiceDialog';
import OptimizedLoader from '@/components/ui/OptimizedLoader';

const CuciMotorServicesList = () => {
  const { services, loading, deleteService, error } = useOptimizedServices('cuci_motor');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus layanan "${name}"?`)) {
      await deleteService(id);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Gagal memuat data layanan. Silakan coba lagi.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Layanan Tersedia</CardTitle>
          <CardDescription>Daftar layanan cuci motor</CardDescription>
        </div>
        <CuciMotorAddServiceDialog />
      </CardHeader>
      <CardContent>
        {loading ? (
          <OptimizedLoader type="grid" count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                Belum ada layanan tersedia
              </div>
            ) : (
              services.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{service.name}</h3>
                      <div className="flex space-x-1">
                        <CuciMotorEditServiceDialog service={service} />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(service.id, service.name)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
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
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CuciMotorServicesList;
