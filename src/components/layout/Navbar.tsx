
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bell, User, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PremiumBadge from '@/components/subscription/PremiumBadge';
import TryPremiumButton from '@/components/subscription/TryPremiumButton';
import { useSubscription } from '@/hooks/useSubscription';

interface NavbarProps {
  businessType?: 'laundry' | 'warung' | 'cuci_motor';
  userName?: string;
  onLogout?: () => void;
}

const Navbar = ({ businessType, userName = "User", onLogout }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { subscriptionData } = useSubscription();

  const getBusinessTypeLabel = (type?: string) => {
    switch (type) {
      case 'laundry': return 'Laundry';
      case 'warung': return 'Warung';
      case 'cuci_motor': return 'Cuci Motor';
      default: return 'Bisnis';
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg"></div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                KasirPro
              </h1>
              {businessType && (
                <p className="text-xs text-gray-500">{getBusinessTypeLabel(businessType)}</p>
              )}
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <PremiumBadge 
              plan={subscriptionData.plan}
              is_trial={subscriptionData.is_trial}
              days_remaining={subscriptionData.days_remaining}
            />
            
            {!subscriptionData.has_premium_access && (
              <TryPremiumButton variant="outline" size="sm" />
            )}
            
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Pengaturan</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-white">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center justify-between p-2">
                    <span>{userName}</span>
                    <PremiumBadge 
                      plan={subscriptionData.plan}
                      is_trial={subscriptionData.is_trial}
                      days_remaining={subscriptionData.days_remaining}
                    />
                  </div>
                  
                  {!subscriptionData.has_premium_access && (
                    <TryPremiumButton className="w-full" />
                  )}
                  
                  <Button variant="ghost" className="justify-start">
                    <Bell className="mr-2 h-5 w-5" />
                    Notifikasi
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    Profil
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    Pengaturan
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start text-red-600"
                    onClick={onLogout}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Keluar
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
