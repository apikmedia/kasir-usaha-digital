
import { useCustomerData } from './customers/useCustomerData';
import { useCustomerOperations } from './customers/useCustomerOperations';
import { useCustomerRealtime } from './customers/useCustomerRealtime';
import type { BusinessType } from '@/types/customer';

export { type Customer } from '@/types/customer';

export const useCustomers = (businessType?: BusinessType) => {
  const { 
    customers, 
    setCustomers, 
    loading, 
    currentUserId, 
    fetchCustomers, 
    addCustomer, 
    updateCustomer: updateCustomerInState, 
    removeCustomer 
  } = useCustomerData(businessType);
  
  const { 
    createCustomer: createCustomerOperation, 
    updateCustomer: updateCustomerOperation, 
    deleteCustomer: deleteCustomerOperation 
  } = useCustomerOperations();
  
  useCustomerRealtime({ businessType, currentUserId, setCustomers });

  const createCustomer = async (customerData: any) => {
    const result = await createCustomerOperation(customerData);
    if (result && typeof result === 'object') {
      // Immediately add to local state for instant UI update
      addCustomer(result);
      return result;
    }
    return false;
  };

  const updateCustomer = async (id: string, customerData: any) => {
    const result = await updateCustomerOperation(id, customerData);
    if (result && typeof result === 'object') {
      // Immediately update local state
      updateCustomerInState(result);
      return result;
    }
    return false;
  };

  const deleteCustomer = async (id: string) => {
    const result = await deleteCustomerOperation(id);
    if (result) {
      // Immediately remove from local state
      removeCustomer(id);
      return true;
    }
    return false;
  };

  return {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers
  };
};
