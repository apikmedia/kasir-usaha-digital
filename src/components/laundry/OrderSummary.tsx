
interface OrderSummaryProps {
  totalAmount: number;
}

const OrderSummary = ({ totalAmount }: OrderSummaryProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (totalAmount <= 0) return null;

  return (
    <div className="p-3 bg-gray-50 rounded-md">
      <div className="text-sm text-gray-600">
        <p>Total Estimasi: <span className="font-semibold text-lg text-blue-600">{formatCurrency(totalAmount)}</span></p>
      </div>
    </div>
  );
};

export default OrderSummary;
