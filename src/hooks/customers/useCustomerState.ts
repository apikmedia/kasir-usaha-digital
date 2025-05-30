
import { useState } from 'react';
import type { Customer, BusinessType } from '@/types/customer';

export const useCustomerState = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const addCustomer = (newCustomer: any) => {
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
    setCustomers(prev => [...prev, typedCustomer].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const updateCustomer = (updatedCustomer: any) => {
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
    setCustomers(prev => prev.map(customer => 
      customer.id === typedCustomer.id ? typedCustomer : customer
    ).sort((a, b) => a.name.localeCompare(b.name)));
  };

  const removeCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== customerId));
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
