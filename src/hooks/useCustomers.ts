
import { useCustomerData } from './customers/useCustomerData';
import { useCustomerOperations } from './customers/useCustomerOperations';
import type { BusinessType } from '@/types/customer';

export { type Customer } from '@/types/customer';

export const useCustomers = (businessType?: BusinessType) => {
  const { 
    customers, 
    setCustomers, 
    loading, 
    currentUserId, 
    fetchCustomers, 
    addCustomer: addCustomerToState, 
    updateCustomer: updateCustomerInState, 
    removeCustomer: removeCustomerFromState
  } = useCustomerData(businessType);
  
  const { 
    createCustomer: createCustomerOperation, 
    updateCustomer: updateCustomerOperation, 
    deleteCustomer: deleteCustomerOperation 
  } = useCustomerOperations();

  const createCustomer = async (customerData: any) => {
    console.log('Creating customer:', customerData);
    const result = await createCustomerOperation(customerData);
    if (result && typeof result === 'object') {
      console.log('Customer created successfully, will be added via real-time subscription');
      return result;
    }
    return false;
  };

  const updateCustomer = async (id: string, customerData: any) => {
    console.log('Updating customer:', id, customerData);
    const result = await updateCustomerOperation(id, customerData);
    if (result && typeof result === 'object') {
      console.log('Customer updated successfully, will be updated via real-time subscription');
      return result;
    }
    return false;
  };

  const deleteCustomer = async (id: string) => {
    console.log('Deleting customer:', id);
    const result = await deleteCustomerOperation(id);
    if (result) {
      console.log('Customer deleted successfully, will be removed via real-time subscription');
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
