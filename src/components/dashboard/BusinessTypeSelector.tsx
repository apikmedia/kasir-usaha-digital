
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Waves, ShoppingCart, Car } from "lucide-react";

interface BusinessTypeSelectorProps {
  onSelectBusinessType: (type: 'laundry' | 'warung' | 'cuci_motor') => void;
}

const BusinessTypeSelector = ({ onSelectBusinessType }: BusinessTypeSelectorProps) => {
  const businessTypes = [
    {
      id: 'laundry' as const,
      title: 'Laundry',
      description: 'Kelola layanan cuci, setrika, dan dry cleaning',
      icon: <Waves className="h-12 w-12 text-blue-500" />,
      features: ['Input berat (kg)', 'Layanan regular/express', 'Status proses/selesai', 'Cetak nota'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'warung' as const,
      title: 'Warung',
      description: 'Sistem kasir untuk toko dan warung makan',
      icon: <ShoppingCart className="h-12 w-12 text-green-500" />,
      features: ['Input produk & qty', 'Subtotal otomatis', 'Manajemen stok', 'Laporan penjualan'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'cuci_motor' as const,
      title: 'Cuci Motor',
      description: 'Khusus untuk layanan cuci dan perawatan motor',
      icon: <Car className="h-12 w-12 text-purple-500" />,
      features: ['Jenis motor', 'Layanan cuci/semir', 'Harga per layanan', 'Tracking kendaraan'],
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pilih Jenis Bisnis Anda
          </h1>
          <p className="text-xl text-gray-600">
            Setiap bisnis memiliki fitur yang disesuaikan dengan kebutuhan spesifik
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {businessTypes.map((business) => (
            <Card 
              key={business.id} 
              className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover-scale cursor-pointer group"
              onClick={() => onSelectBusinessType(business.id)}
            >
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${business.color}`}></div>
              
              <CardHeader className="text-center pt-8">
                <div className="mx-auto mb-4 p-4 bg-gray-50 rounded-full w-fit group-hover:bg-gray-100 transition-colors">
                  {business.icon}
                </div>
                <CardTitle className="text-2xl text-gray-900">{business.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {business.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {business.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full bg-gradient-to-r ${business.color} hover:opacity-90 text-white font-semibold`}
                  onClick={() => onSelectBusinessType(business.id)}
                >
                  Pilih {business.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Anda dapat mengubah jenis bisnis nanti di pengaturan akun
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessTypeSelector;
