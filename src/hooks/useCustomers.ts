
import { useOptimizedCustomers } from './useOptimizedCustomers';
import { useCustomerOperations } from './customers/useCustomerOperations';
import type { BusinessType } from '@/types/customer';

export { type Customer } from '@/types/customer';

export const useCustomers = (businessType?: BusinessType) => {
  const { 
    customers, 
    loading, 
    refetch,
    invalidate
  } = useOptimizedCustomers(businessType);
  
  const { 
    createCustomer: createCustomerOperation, 
    updateCustomer: updateCustomerOperation, 
    deleteCustomer: deleteCustomerOperation 
  } = useCustomerOperations();

  const createCustomer = async (customerData: any) => {
    console.log('Creating customer:', customerData.name);
    const result = await createCustomerOperation(customerData);
    if (result && typeof result === 'object') {
      console.log('Customer created successfully');
      invalidate();
      return result;
    }
    return false;
  };

  const updateCustomer = async (id: string, customerData: any) => {
    console.log('Updating customer:', id, customerData.name);
    const result = await updateCustomerOperation(id, customerData);
    if (result && typeof result === 'object') {
      console.log('Customer updated successfully');
      invalidate();
      return result;
    }
    return false;
  };

  const deleteCustomer = async (id: string) => {
    console.log('Deleting customer:', id);
    
    const result = await deleteCustomerOperation(id);
    if (result) {
      console.log('Customer deleted successfully');
      invalidate();
      return true;
    } else {
      console.log('Delete failed');
      return false;
    }
  };

  return {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch
  };
};
