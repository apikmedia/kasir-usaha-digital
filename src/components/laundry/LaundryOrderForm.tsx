
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLaundryOrderForm } from '@/hooks/laundry/useLaundryOrderForm';
import CustomerSelection from './CustomerSelection';
import ServiceDetails from './ServiceDetails';
import DeliveryOptions from './DeliveryOptions';
import OrderNotes from './OrderNotes';
import OrderSummary from './OrderSummary';
import LaundryPaymentOptions from './LaundryPaymentOptions';
import CreateOrderButton from './CreateOrderButton';

interface LaundryOrderFormProps {
  onOrderCreated?: () => void;
}

const LaundryOrderForm = ({ onOrderCreated }: LaundryOrderFormProps) => {
  const {
    orderData,
    setOrderData,
    isSubmitting,
    services,
    handleCreateOrder,
    handleCustomerAdded,
    calculateTotal,
    isFormValid
  } = useLaundryOrderForm(onOrderCreated);

  const handleOrderDataChange = (data: Partial<typeof orderData>) => {
    setOrderData(prev => ({ ...prev, ...data }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Pesanan Baru</CardTitle>
        <CardDescription>Tambahkan pesanan laundry baru</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CustomerSelection
          orderData={orderData}
          setOrderData={handleOrderDataChange}
          onCustomerAdded={handleCustomerAdded}
        />
        
        <ServiceDetails
          orderData={orderData}
          setOrderData={handleOrderDataChange}
          services={services}
        />

        <DeliveryOptions
          orderData={orderData}
          setOrderData={handleOrderDataChange}
        />

        <LaundryPaymentOptions
          orderData={orderData}
          setOrderData={handleOrderDataChange}
        />

        <OrderNotes
          orderData={orderData}
          setOrderData={handleOrderDataChange}
        />

        <OrderSummary
          totalAmount={calculateTotal()}
        />

        <CreateOrderButton
          onCreateOrder={handleCreateOrder}
          isFormValid={isFormValid()}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
};

export default LaundryOrderForm;
