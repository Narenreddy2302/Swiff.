import { format, formatDistance, formatRelative, isValid } from 'date-fns';

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (e.g., 'USD', 'EUR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date
 * @param {Date|string|number} date - The date to format
 * @param {string} formatStr - Format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);

  if (!isValid(dateObj)) return '';

  return format(dateObj, formatStr);
};

/**
 * Format date to relative time (e.g., '2 days ago')
 * @param {Date|string|number} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);

  if (!isValid(dateObj)) return '';

  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

/**
 * Format date relative to now (e.g., 'yesterday at 3:20 PM')
 * @param {Date|string|number} date - The date to format
 * @returns {string} Formatted relative date
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);

  if (!isValid(dateObj)) return '';

  return formatRelative(dateObj, new Date());
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 0) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return '';

  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Convert Firestore timestamp to Date
 * @param {object} timestamp - Firestore timestamp
 * @returns {Date|null} Date object or null
 */
export const firestoreTimestampToDate = (timestamp) => {
  if (!timestamp) return null;

  // Check if it's a Firestore Timestamp
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }

  // Check if it has seconds property (Firestore Timestamp format)
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }

  // Otherwise try to convert directly
  return new Date(timestamp);
};
