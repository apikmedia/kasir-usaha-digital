
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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
          Total: {totalCount} pesanan | Halaman {currentPage} dari {totalPages}
        </CardDescription>
      </div>
      {isLoading && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
    </CardHeader>
  );
};

export default LaundryOrdersHeader;
