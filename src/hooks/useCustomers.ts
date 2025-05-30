
import { useCustomerData } from './customers/useCustomerData';
import { useCustomerOperations } from './customers/useCustomerOperations';
import { useCustomerRealtime } from './customers/useCustomerRealtime';
import type { BusinessType } from '@/types/customer';

export { type Customer } from '@/types/customer';

export const useCustomers = (businessType?: BusinessType) => {
  const { customers, setCustomers, loading, currentUserId, fetchCustomers } = useCustomerData(businessType);
  const { createCustomer, updateCustomer, deleteCustomer } = useCustomerOperations();
  
  useCustomerRealtime({ businessType, currentUserId, setCustomers });

  return {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers
  };
};
