
import { CURRENCY_FORMAT, DATE_FORMAT } from './constants';

/**
 * Format currency to Indonesian Rupiah
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(CURRENCY_FORMAT.locale, {
    style: 'currency',
    currency: CURRENCY_FORMAT.currency,
    minimumFractionDigits: CURRENCY_FORMAT.minimumFractionDigits
  }).format(amount);
};

/**
 * Format date to Indonesian locale
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(DATE_FORMAT.locale, DATE_FORMAT.options as any);
};

/**
 * Format date for display (shorter format)
 */
export const formatDateShort = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Format time only
 */
export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Generate order number with prefix and date
 */
export const generateOrderNumber = (businessType: string): string => {
  const prefixes = {
    'laundry': 'LDY',
    'warung': 'WRG',
    'cuci_motor': 'CMT'
  };
  
  const prefix = prefixes[businessType as keyof typeof prefixes] || 'ORD';
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = date.getTime().toString().slice(-4);
  
  return `${prefix}${dateStr}${timeStr}`;
};

/**
 * Calculate estimated finish time
 */
export const calculateEstimatedFinish = (
  services: Array<{ estimatedDuration: number }>,
  startTime: Date = new Date()
): Date => {
  const totalMinutes = services.reduce((total, service) => total + service.estimatedDuration, 0);
  const finishTime = new Date(startTime);
  finishTime.setMinutes(finishTime.getMinutes() + totalMinutes);
  return finishTime;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Indonesian phone number
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
};

/**
 * Format phone number to standard format
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\s|-/g, '');
  if (cleaned.startsWith('0')) {
    return '+62' + cleaned.slice(1);
  }
  if (cleaned.startsWith('62')) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('+62')) {
    return cleaned;
  }
  return phone;
};

/**
 * Generate a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string): string => {
  return text.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Get business type color theme
 */
export const getBusinessTypeTheme = (businessType: string) => {
  const themes = {
    'laundry': {
      primary: 'from-blue-500 to-cyan-600',
      secondary: 'from-blue-50 to-cyan-50',
      accent: 'blue-500',
      light: 'blue-50'
    },
    'warung': {
      primary: 'from-green-500 to-emerald-600',
      secondary: 'from-green-50 to-emerald-50',
      accent: 'green-500',
      light: 'green-50'
    },
    'cuci_motor': {
      primary: 'from-purple-500 to-pink-600',
      secondary: 'from-purple-50 to-pink-50',
      accent: 'purple-500',
      light: 'purple-50'
    }
  };
  
  return themes[businessType as keyof typeof themes] || themes.warung;
};

/**
 * Get status badge color
 */
export const getStatusBadgeColor = (status: string) => {
  const colors = {
    'antrian': 'bg-yellow-100 text-yellow-800',
    'proses': 'bg-blue-100 text-blue-800',
    'selesai': 'bg-green-100 text-green-800',
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-gray-100 text-gray-800',
    'paid': 'bg-green-100 text-green-800',
    'unpaid': 'bg-red-100 text-red-800'
  };
  
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if date is today
 */
export const isToday = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  
  return checkDate.toDateString() === today.toDateString();
};

/**
 * Check if date is this week
 */
export const isThisWeek = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return checkDate >= startOfWeek && checkDate <= endOfWeek;
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};

/**
 * Calculate total from array of items
 */
export const calculateTotal = (items: Array<{ price: number; quantity: number }>): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

/**
 * Sort array by date (newest first)
 */
export const sortByDateDesc = <T extends { createdAt: string }>(items: T[]): T[] => {
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Group items by date
 */
export const groupByDate = <T extends { createdAt: string }>(items: T[]): Record<string, T[]> => {
  return items.reduce((groups, item) => {
    const date = formatDateShort(item.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Local storage helpers
 */
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};
