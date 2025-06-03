
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import CuciMotorDashboardHeader from './CuciMotorDashboardHeader';
import CuciMotorDashboardTabs from './CuciMotorDashboardTabs';
import MobileNavigation from '../mobile/MobileNavigation';
import PremiumTrialCard from '../premium/PremiumTrialCard';
import PremiumNotificationCenter from '../premium/PremiumNotificationCenter';
import NotificationCenter from '../notifications/NotificationCenter';

const CuciMotorDashboard = () => {
  const [currentTab, setCurrentTab] = useState("orders");
  const isMobile = useIsMobile();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="mt-12 md:mt-0">
        <div className="flex items-center justify-between">
          <CuciMotorDashboardHeader />
          <div className="flex items-center gap-2">
            <NotificationCenter />
          </div>
        </div>
      </div>
      
      <MobileNavigation 
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        businessType="cuci_motor"
      />

      {/* Premium Trial Card - Show on orders tab */}
      {currentTab === "orders" && (
        <div className="space-y-4">
          <PremiumTrialCard />
          <PremiumNotificationCenter />
        </div>
      )}

      <CuciMotorDashboardTabs currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default CuciMotorDashboard;
