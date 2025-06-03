
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, ShoppingCart, Waves, Settings, Crown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  businessType: 'laundry' | 'warung' | 'cuci_motor';
}

const MobileNavigation = ({ currentTab, onTabChange, businessType }: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const getIcon = (tab: string) => {
    switch (tab) {
      case 'orders':
      case 'cashier':
        return <Home className="h-4 w-4" />;
      case 'products':
      case 'customers':
      case 'services':
        return <ShoppingCart className="h-4 w-4" />;
      case 'reports':
        return <Waves className="h-4 w-4" />;
      case 'subscription':
        return <Crown className="h-4 w-4" />;
      case 'settings':
        return <Settings className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'orders':
        return 'Pesanan';
      case 'cashier':
        return 'Kasir';
      case 'customers':
        return 'Pelanggan';
      case 'services':
        return 'Layanan';
      case 'products':
        return 'Produk';
      case 'reports':
        return 'Laporan';
      case 'subscription':
        return 'Premium';
      case 'settings':
        return 'Pengaturan';
      case 'history':
        return 'Riwayat';
      default:
        return tab;
    }
  };

  const tabs = businessType === 'warung' 
    ? ['cashier', 'products', 'orders', 'reports', 'subscription', 'settings']
    : businessType === 'laundry'
    ? ['orders', 'customers', 'services', 'reports', 'history', 'subscription', 'settings']
    : ['orders', 'customers', 'services', 'reports', 'subscription', 'settings'];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="fixed top-4 left-4 z-50">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <div className="py-4">
          <h3 className="font-semibold mb-4">Menu Navigasi</h3>
          <div className="space-y-2">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant={currentTab === tab ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  onTabChange(tab);
                  setIsOpen(false);
                }}
              >
                {getIcon(tab)}
                <span className="ml-2">{getTabLabel(tab)}</span>
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
