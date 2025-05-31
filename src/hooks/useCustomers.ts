
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
    removeCustomer
  } = useCustomerData(businessType);
  
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
      return result;
    }
    return false;
  };

  const updateCustomer = async (id: string, customerData: any) => {
    console.log('Updating customer:', id, customerData.name);
    const result = await updateCustomerOperation(id, customerData);
    if (result && typeof result === 'object') {
      console.log('Customer updated successfully');
      return result;
    }
    return false;
  };

  const deleteCustomer = async (id: string) => {
    console.log('Deleting customer:', id);
    
    // Immediately remove from local state for instant UI feedback
    removeCustomer(id);
    
    const result = await deleteCustomerOperation(id);
    if (result) {
      console.log('Customer deleted successfully');
      return true;
    } else {
      // If delete failed, refresh data to restore the item
      console.log('Delete failed, refreshing data');
      await fetchCustomers();
      return false;
    }
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
