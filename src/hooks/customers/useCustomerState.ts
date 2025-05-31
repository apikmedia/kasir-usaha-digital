
import { useState } from 'react';
import type { Customer, BusinessType } from '@/types/customer';

export const useCustomerState = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const addCustomer = (newCustomer: any) => {
    console.log('Adding customer to state:', newCustomer);
    // Type-cast the customer data to ensure proper typing
    const typedCustomer: Customer = {
      id: newCustomer.id,
      name: newCustomer.name,
      phone: newCustomer.phone || undefined,
      email: newCustomer.email || undefined,
      address: newCustomer.address || undefined,
      notes: newCustomer.notes || undefined,
      business_type: newCustomer.business_type as BusinessType,
      user_id: newCustomer.user_id,
      created_at: newCustomer.created_at,
      updated_at: newCustomer.updated_at
    };
    
    setCustomers(prev => {
      const exists = prev.find(c => c.id === typedCustomer.id);
      if (exists) {
        console.log('Customer already exists, skipping add');
        return prev;
      }
      const updated = [...prev, typedCustomer].sort((a, b) => a.name.localeCompare(b.name));
      console.log('Updated customers after add:', updated);
      return updated;
    });
  };

  const updateCustomer = (updatedCustomer: any) => {
    console.log('Updating customer in state:', updatedCustomer);
    // Type-cast the customer data to ensure proper typing
    const typedCustomer: Customer = {
      id: updatedCustomer.id,
      name: updatedCustomer.name,
      phone: updatedCustomer.phone || undefined,
      email: updatedCustomer.email || undefined,
      address: updatedCustomer.address || undefined,
      notes: updatedCustomer.notes || undefined,
      business_type: updatedCustomer.business_type as BusinessType,
      user_id: updatedCustomer.user_id,
      created_at: updatedCustomer.created_at,
      updated_at: updatedCustomer.updated_at
    };
    
    setCustomers(prev => {
      const updated = prev.map(customer => 
        customer.id === typedCustomer.id ? typedCustomer : customer
      ).sort((a, b) => a.name.localeCompare(b.name));
      console.log('Updated customers after update:', updated);
      return updated;
    });
  };

  const removeCustomer = (customerId: string) => {
    console.log('Removing customer from state:', customerId);
    setCustomers(prev => {
      const updated = prev.filter(customer => customer.id !== customerId);
      console.log('Updated customers after remove:', updated);
      return updated;
    });
  };

  return {
    customers,
    setCustomers,
    currentUserId,
    setCurrentUserId,
    addCustomer,
    updateCustomer,
    removeCustomer
  };
};
