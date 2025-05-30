
import CuciMotorDashboardHeader from './CuciMotorDashboardHeader';
import CuciMotorDashboardTabs from './CuciMotorDashboardTabs';

const CuciMotorDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <CuciMotorDashboardHeader />
      <CuciMotorDashboardTabs />
    </div>
  );
};

export default CuciMotorDashboard;
