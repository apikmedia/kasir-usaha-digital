
import { useState } from 'react';
import BusinessTypeSelector from './dashboard/BusinessTypeSelector';
import LaundryDashboard from './dashboard/LaundryDashboard';
import WarungDashboard from './dashboard/WarungDashboard';
import CuciMotorDashboard from './dashboard/CuciMotorDashboard';

const DemoApp = () => {
  const [businessType, setBusinessType] = useState<'laundry' | 'warung' | 'cuci_motor' | null>(null);

  const handleBusinessTypeSelection = (type: 'laundry' | 'warung' | 'cuci_motor') => {
    setBusinessType(type);
  };

  const handleLogout = () => {
    setBusinessType(null);
  };

  if (!businessType) {
    return <BusinessTypeSelector onSelectBusinessType={handleBusinessTypeSelection} />;
  }

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

export default DemoApp;
