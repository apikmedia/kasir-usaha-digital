
import { useState } from 'react';
import type { Customer } from '@/types/customer';

export const useCustomerState = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const addCustomer = (newCustomer: any) => {
    console.log('Adding customer to state:', newCustomer.id, newCustomer.name);
    
    setCustomers(prev => {
      // Check if customer already exists to prevent duplicates
      const exists = prev.find(c => c.id === newCustomer.id);
      if (exists) {
        console.log('Customer already exists, skipping add');
        return prev;
      }
      
      const typedCustomer: Customer = {
        id: newCustomer.id,
        name: newCustomer.name,
        phone: newCustomer.phone || undefined,
        email: newCustomer.email || undefined,
        address: newCustomer.address || undefined,
        notes: newCustomer.notes || undefined,
        business_type: newCustomer.business_type,
        user_id: newCustomer.user_id,
        created_at: newCustomer.created_at,
        updated_at: newCustomer.updated_at
      };
      
      const updated = [...prev, typedCustomer].sort((a, b) => a.name.localeCompare(b.name));
      console.log('Customers after add:', updated.length);
      return updated;
    });
  };

  const updateCustomer = (updatedCustomer: any) => {
    console.log('Updating customer in state:', updatedCustomer.id, updatedCustomer.name);
    
    setCustomers(prev => {
      const typedCustomer: Customer = {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        phone: updatedCustomer.phone || undefined,
        email: updatedCustomer.email || undefined,
        address: updatedCustomer.address || undefined,
        notes: updatedCustomer.notes || undefined,
        business_type: updatedCustomer.business_type,
        user_id: updatedCustomer.user_id,
        created_at: updatedCustomer.created_at,
        updated_at: updatedCustomer.updated_at
      };
      
      const updated = prev.map(customer => 
        customer.id === typedCustomer.id ? typedCustomer : customer
      ).sort((a, b) => a.name.localeCompare(b.name));
      
      console.log('Customers after update:', updated.length);
      return updated;
    });
  };

  const removeCustomer = (customerId: string) => {
    console.log('Removing customer from state:', customerId);
    setCustomers(prev => {
      const updated = prev.filter(customer => customer.id !== customerId);
      console.log('Customers after remove:', updated.length);
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
