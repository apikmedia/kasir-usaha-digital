
// Application constants for KasirPro POS System

export const BUSINESS_TYPES = {
  LAUNDRY: 'laundry',
  WARUNG: 'warung',
  CUCI_MOTOR: 'cuci_motor'
} as const;

export const SUBSCRIPTION_PLANS = {
  BASIC: 'basic',
  PREMIUM: 'premium'
} as const;

export const ORDER_STATUS = {
  ANTRIAN: 'antrian',
  PROSES: 'proses',
  SELESAI: 'selesai'
} as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  TRANSFER: 'transfer'
} as const;

export const BUSINESS_LABELS = {
  [BUSINESS_TYPES.LAUNDRY]: 'Laundry',
  [BUSINESS_TYPES.WARUNG]: 'Warung',
  [BUSINESS_TYPES.CUCI_MOTOR]: 'Cuci Motor'
} as const;

export const SUBSCRIPTION_LIMITS = {
  [SUBSCRIPTION_PLANS.BASIC]: {
    dailyTransactions: 10,
    canSaveCustomers: false,
    canExportReports: false,
    maxProducts: 50,
    maxServices: 10
  },
  [SUBSCRIPTION_PLANS.PREMIUM]: {
    dailyTransactions: Infinity,
    canSaveCustomers: true,
    canExportReports: true,
    maxProducts: Infinity,
    maxServices: Infinity
  }
} as const;

export const DEFAULT_SERVICES = {
  [BUSINESS_TYPES.LAUNDRY]: [
    { name: 'Cuci Regular', price: 5000, unit: 'kg', estimatedDuration: 1440 },
    { name: 'Cuci Express', price: 8000, unit: 'kg', estimatedDuration: 480 },
    { name: 'Cuci + Setrika', price: 7000, unit: 'kg', estimatedDuration: 1440 },
    { name: 'Dry Clean', price: 15000, unit: 'kg', estimatedDuration: 2880 }
  ],
  [BUSINESS_TYPES.CUCI_MOTOR]: [
    { name: 'Cuci Basic', price: 10000, unit: 'unit', estimatedDuration: 30 },
    { name: 'Cuci Premium', price: 15000, unit: 'unit', estimatedDuration: 45 },
    { name: 'Semir Body', price: 20000, unit: 'unit', estimatedDuration: 60 },
    { name: 'Semir Helm', price: 5000, unit: 'unit', estimatedDuration: 15 },
    { name: 'Cuci Mesin', price: 25000, unit: 'unit', estimatedDuration: 90 },
    { name: 'Wax', price: 30000, unit: 'unit', estimatedDuration: 120 }
  ]
} as const;

export const BIKE_TYPES = [
  'Honda Vario',
  'Honda Beat',
  'Honda Scoopy',
  'Honda PCX',
  'Yamaha Nmax',
  'Yamaha Mio',
  'Yamaha Aerox',
  'Suzuki Address',
  'Kawasaki Ninja',
  'Vespa',
  'Motor Bebek',
  'Motor Sport',
  'Motor Matic',
  'Motor Kopling'
] as const;

export const PRODUCT_CATEGORIES = [
  'Makanan',
  'Minuman',
  'Snack',
  'Rokok',
  'Kebutuhan Sehari-hari',
  'Alat Tulis',
  'Elektronik',
  'Lainnya'
] as const;

export const CURRENCY_FORMAT = {
  locale: 'id-ID',
  currency: 'IDR',
  minimumFractionDigits: 0
} as const;

export const DATE_FORMAT = {
  locale: 'id-ID',
  options: {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
} as const;

// Validation rules
export const VALIDATION_RULES = {
  minPasswordLength: 6,
  maxBusinessNameLength: 100,
  maxCustomerNameLength: 100,
  maxProductNameLength: 100,
  maxServiceNameLength: 100,
  maxNotesLength: 500,
  minPrice: 0,
  maxPrice: 999999999,
  minWeight: 0.1,
  maxWeight: 999.9,
  minStock: 0,
  maxStock: 999999
} as const;

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Field ini wajib diisi',
  INVALID_EMAIL: 'Format email tidak valid',
  PASSWORD_TOO_SHORT: `Password minimal ${VALIDATION_RULES.minPasswordLength} karakter`,
  INVALID_PHONE: 'Format nomor telepon tidak valid',
  INVALID_PRICE: 'Harga harus berupa angka positif',
  DAILY_LIMIT_REACHED: 'Batas transaksi harian telah tercapai. Upgrade ke Premium untuk transaksi unlimited.',
  NETWORK_ERROR: 'Koneksi bermasalah. Silakan coba lagi.',
  UNAUTHORIZED: 'Anda tidak memiliki akses untuk melakukan aksi ini',
  SERVER_ERROR: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Berhasil masuk',
  REGISTER_SUCCESS: 'Akun berhasil dibuat',
  ORDER_CREATED: 'Pesanan berhasil dibuat',
  ORDER_UPDATED: 'Pesanan berhasil diperbarui',
  PRODUCT_CREATED: 'Produk berhasil ditambahkan',
  PRODUCT_UPDATED: 'Produk berhasil diperbarui',
  CUSTOMER_CREATED: 'Pelanggan berhasil ditambahkan',
  PROFILE_UPDATED: 'Profil berhasil diperbarui'
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'kasirpro_user_preferences',
  CART_DATA: 'kasirpro_cart_data',
  LAST_BUSINESS_TYPE: 'kasirpro_last_business_type'
} as const;

// API endpoints (for future Supabase integration)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },
  ORDERS: '/orders',
  PRODUCTS: '/products',
  SERVICES: '/services',
  CUSTOMERS: '/customers',
  REPORTS: '/reports',
  SUBSCRIPTION: '/subscription'
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_CUSTOMER_MANAGEMENT: true,
  ENABLE_REPORTS: true,
  ENABLE_PRINT: true,
  ENABLE_EXPORT: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_MULTI_PAYMENT: true
} as const;
