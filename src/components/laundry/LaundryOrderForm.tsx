
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLaundryOrderForm } from '@/hooks/laundry/useLaundryOrderForm';
import CustomerSelection from './CustomerSelection';
import ServiceDetails from './ServiceDetails';
import DeliveryOptions from './DeliveryOptions';
import OrderNotes from './OrderNotes';
import OrderSummary from './OrderSummary';
import CreateOrderButton from './CreateOrderButton';

const LaundryOrderForm = () => {
  const {
    orderData,
    setOrderData,
    isSubmitting,
    services,
    handleCreateOrder,
    handleCustomerAdded,
    calculateTotal,
    isFormValid
  } = useLaundryOrderForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Pesanan Baru</CardTitle>
        <CardDescription>Tambahkan pesanan laundry baru</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CustomerSelection
          orderData={orderData}
          setOrderData={setOrderData}
          onCustomerAdded={handleCustomerAdded}
        />
        
        <ServiceDetails
          orderData={orderData}
          setOrderData={setOrderData}
          services={services}
        />

        <DeliveryOptions
          orderData={orderData}
          setOrderData={setOrderData}
        />

        <OrderNotes
          orderData={orderData}
          setOrderData={setOrderData}
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
