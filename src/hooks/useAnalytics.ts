
import { supabase } from '@/integrations/supabase/client';
import type { BusinessType } from '@/types/order';

export const useAnalytics = () => {
  const trackEvent = async (
    businessType: BusinessType,
    eventType: string,
    eventData: any,
    revenueAmount: number = 0
  ) => {
    try {
      const { data, error } = await supabase.rpc('create_analytics_event', {
        p_business_type: businessType,
        p_event_type: eventType,
        p_event_data: eventData,
        p_revenue_amount: revenueAmount
      });

      if (error) {
        console.error('Error tracking analytics event:', error);
        return;
      }

      console.log('Analytics event tracked:', eventType, data);
      return data;
    } catch (error) {
      console.error('Error in trackEvent:', error);
    }
  };

  const trackOrderCreated = async (businessType: BusinessType, orderData: any) => {
    return trackEvent(businessType, 'order_created', orderData, orderData.total_amount || 0);
  };

  const trackOrderCompleted = async (businessType: BusinessType, orderData: any) => {
    return trackEvent(businessType, 'order_completed', orderData, orderData.total_amount || 0);
  };

  const trackPaymentReceived = async (businessType: BusinessType, paymentData: any) => {
    return trackEvent(businessType, 'payment_received', paymentData, paymentData.amount || 0);
  };

  return {
    trackEvent,
    trackOrderCreated,
    trackOrderCompleted,
    trackPaymentReceived
  };
};
