// App constants

export const APP_NAME = 'Swiff';

// Currency options
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

// Billing cycles for subscriptions
export const BILLING_CYCLES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

// Expense categories
export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food & Dining', icon: '🍔' },
  { value: 'groceries', label: 'Groceries', icon: '🛒' },
  { value: 'transportation', label: 'Transportation', icon: '🚗' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'utilities', label: 'Utilities', icon: '💡' },
  { value: 'rent', label: 'Rent', icon: '🏠' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'healthcare', label: 'Healthcare', icon: '⚕️' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'other', label: 'Other', icon: '📌' },
];

// Subscription categories
export const SUBSCRIPTION_CATEGORIES = [
  { value: 'streaming', label: 'Streaming', icon: '📺' },
  { value: 'software', label: 'Software', icon: '💻' },
  { value: 'fitness', label: 'Fitness', icon: '💪' },
  { value: 'music', label: 'Music', icon: '🎵' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'news', label: 'News & Magazines', icon: '📰' },
  { value: 'cloud', label: 'Cloud Storage', icon: '☁️' },
  { value: 'other', label: 'Other', icon: '📌' },
];

// Split methods
export const SPLIT_METHODS = [
  { value: 'equal', label: 'Split Equally' },
  { value: 'custom', label: 'Custom Amounts' },
  { value: 'percentage', label: 'By Percentage' },
  { value: 'shares', label: 'By Shares' },
];

// Bill/Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SETTLED: 'settled',
  OVERDUE: 'overdue',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  BILLS: '/bills',
  BILL_DETAIL: '/bills/:id',
  CREATE_BILL: '/bills/create',
  SUBSCRIPTIONS: '/subscriptions',
  SUBSCRIPTION_DETAIL: '/subscriptions/:id',
  CREATE_SUBSCRIPTION: '/subscriptions/create',
  GROUPS: '/groups',
  GROUP_DETAIL: '/groups/:id',
  CREATE_GROUP: '/groups/create',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};
