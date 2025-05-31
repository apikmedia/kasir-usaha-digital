
import { useEffect } from 'react';

// Simplified preloader that doesn't aggressively fetch data
export const useAppPreloader = () => {
  useEffect(() => {
    console.log('App preloader initialized - using on-demand loading for better performance');
    
    // Only do minimal initialization, let components load their own data
    // This prevents the aggressive preloading that was slowing down the app
  }, []);
};
