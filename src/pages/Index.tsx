
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, TrendingUp, Shield, Star } from "lucide-react";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);

  const features = [
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Multi-Bisnis",
      description: "Mendukung Laundry, Warung, dan Cuci Motor dalam satu platform"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      title: "Laporan Real-time",
      description: "Dashboard analitik dengan laporan harian dan mingguan"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Sistem Freemium",
      description: "Mulai gratis dengan upgrade ke Premium untuk fitur lengkap"
    }
  ];

  const plans = [
    {
      name: "Basic",
      price: "Gratis",
      description: "Cocok untuk bisnis kecil yang baru memulai",
      features: [
        "10 transaksi per hari",
        "Dashboard basic",
        "Laporan sederhana",
        "1 jenis bisnis"
      ],
      popular: false
    },
    {
      name: "Premium",
      price: "Rp 99.000/bulan",
      description: "Untuk bisnis yang berkembang pesat",
      features: [
        "Transaksi unlimited",
        "Manajemen pelanggan",
        "Export laporan Excel/PDF",
        "Multi cabang",
        "Backup otomatis",
        "Support prioritas"
      ],
      popular: true
    }
  ];

  if (showAuth) {
    return <AuthPage onBack={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                KasirPro
              </h1>
            </div>
            <Button 
              onClick={() => setShowAuth(true)}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold px-6"
            >
              Masuk / Daftar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Kelola Bisnis Anda dengan
            <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Sistem POS Modern
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Platform kasir all-in-one untuk Laundry, Warung, dan Cuci Motor. 
            Tingkatkan efisiensi bisnis Anda dengan teknologi terdepan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowAuth(true)}
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold"
            >
              Mulai Gratis Sekarang
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-green-300 text-green-700 hover:bg-green-50">
              Lihat Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/50 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Mengapa Memilih KasirPro?
            </h2>
            <p className="text-xl text-gray-600">
              Solusi lengkap untuk berbagai jenis bisnis
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300 hover-scale">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pilih Paket Yang Tepat
            </h2>
            <p className="text-xl text-gray-600">
              Mulai gratis, upgrade kapan saja
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-green-500 bg-gradient-to-br from-green-50 to-blue-50' : 'bg-white'} hover:shadow-lg transition-all duration-300`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      Paling Populer
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl text-gray-900">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-green-600 my-4">{plan.price}</div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => setShowAuth(true)}
                    className={`w-full ${plan.popular 
                      ? 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white' 
                      : 'bg-white border-2 border-green-500 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {plan.name === 'Basic' ? 'Mulai Gratis' : 'Upgrade ke Premium'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg"></div>
            <h3 className="text-2xl font-bold">KasirPro</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Solusi POS terdepan untuk bisnis modern
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 KasirPro. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Auth Component (placeholder for now)
const AuthPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Autentikasi</CardTitle>
          <CardDescription>
            Masuk atau daftar untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Fitur autentikasi akan diimplementasi setelah integrasi Supabase aktif.
            </p>
            <Button onClick={onBack} variant="outline" className="w-full">
              Kembali ke Beranda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
