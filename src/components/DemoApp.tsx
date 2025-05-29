
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import BusinessTypeSelector from './dashboard/BusinessTypeSelector';
import LaundryDashboard from './dashboard/LaundryDashboard';
import WarungDashboard from './dashboard/WarungDashboard';
import CuciMotorDashboard from './dashboard/CuciMotorDashboard';
import Navbar from './layout/Navbar';
import { useToast } from '@/hooks/use-toast';

const DemoApp = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [businessType, setBusinessType] = useState<'laundry' | 'warung' | 'cuci_motor' | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Berhasil Masuk",
            description: "Selamat datang di KasirPro!",
          });
        } else if (event === 'SIGNED_OUT') {
          setBusinessType(null);
          toast({
            title: "Berhasil Keluar",
            description: "Sampai jumpa lagi!",
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleBusinessTypeSelection = (type: 'laundry' | 'warung' | 'cuci_motor') => {
    setBusinessType(type);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error",
          description: "Gagal keluar dari akun",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat keluar",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user || !session) {
    window.location.href = '/';
    return null;
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  if (!businessType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100">
        <Navbar 
          userName={userName}
          onLogout={handleLogout}
        />
        <BusinessTypeSelector onSelectBusinessType={handleBusinessTypeSelection} />
      </div>
    );
  }

  const renderDashboard = () => {
    switch (businessType) {
      case 'laundry':
        return <LaundryDashboard />;
      case 'warung':
        return <WarungDashboard />;
      case 'cuci_motor':
        return <CuciMotorDashboard />;
      default:
        return <BusinessTypeSelector onSelectBusinessType={handleBusinessTypeSelection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100">
      <Navbar 
        businessType={businessType}
        userName={userName}
        onLogout={handleLogout}
      />
      {renderDashboard()}
    </div>
  );
};

export default DemoApp;
