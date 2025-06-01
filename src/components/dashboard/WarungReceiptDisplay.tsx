
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReceiptGenerator from '@/components/receipt/ReceiptGenerator';

interface WarungReceiptDisplayProps {
  currentReceipt: any;
}

const WarungReceiptDisplay = ({ currentReceipt }: WarungReceiptDisplayProps) => {
  if (!currentReceipt) return null;

  return (
    <div className="mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Nota Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-sm">{currentReceipt.orderNumber}</span>
            <div className="flex space-x-2">
              <ReceiptGenerator receiptData={currentReceipt} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarungReceiptDisplay;
