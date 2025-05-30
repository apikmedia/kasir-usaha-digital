
import { Car } from "lucide-react";

const CuciMotorDashboardHeader = () => {
  return (
    <div className="flex items-center space-x-2">
      <Car className="h-8 w-8 text-purple-500" />
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Cuci Motor</h1>
    </div>
  );
};

export default CuciMotorDashboardHeader;
