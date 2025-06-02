
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import LaundryOrderModal from './LaundryOrderModal';

interface LaundryOrdersHeaderProps {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
}

const LaundryOrdersHeader = ({ totalCount, currentPage, totalPages, isLoading }: LaundryOrdersHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Daftar Pesanan</CardTitle>
        <CardDescription>
          {isLoading ? (
            "Memuat data pesanan..."
          ) : (
            `Total ${totalCount} pesanan • Halaman ${currentPage} dari ${totalPages}`
          )}
        </CardDescription>
      </div>
      <LaundryOrderModal />
    </CardHeader>
  );
};

export default LaundryOrdersHeader;
