import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { SUBSCRIPTION_CATEGORIES } from '../../../utils/constants';

const SubscriptionCard = ({ subscription, onEdit, onCancel }) => {
  const isActive = subscription.status === 'active';
  const daysUntilRenewal = subscription.daysUntilRenewal;

  // Get category info
  const categoryInfo = SUBSCRIPTION_CATEGORIES.find(
    (cat) => cat.value === subscription.category
  ) || { icon: '📌', label: 'Other' };

  // Format amount with currency symbol
  const formatAmount = (amount, currency) => {
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
    };
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  // Format billing cycle
  const formatBillingCycle = (cycle) => {
    return `/${cycle === 'yearly' ? 'year' : cycle === 'monthly' ? 'month' : cycle === 'weekly' ? 'week' : cycle}`;
  };

  // Determine renewal status color
  const getRenewalStatusColor = () => {
    if (!isActive) return 'text-gray-500';
    if (daysUntilRenewal <= 3) return 'text-red-600';
    if (daysUntilRenewal <= 7) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow-card hover:shadow-lg transition-all duration-300 overflow-hidden ${
        !isActive ? 'opacity-60' : ''
      }`}
    >
      <div className="p-6">
        {/* Header with Icon and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
              {categoryInfo.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {subscription.service_name}
              </h3>
              <p className="text-xs text-gray-500">{categoryInfo.label}</p>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isActive ? 'Active' : 'Cancelled'}
          </span>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {formatAmount(subscription.amount, subscription.currency)}
            </span>
            <span className="text-sm text-gray-600">
              {formatBillingCycle(subscription.billing_cycle)}
            </span>
          </div>
        </div>

        {/* Renewal Information */}
        {isActive && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Next billing:</span>
              <span className="font-medium text-gray-900">
                {new Date(subscription.next_billing_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Renews in:</span>
              <span className={`font-medium ${getRenewalStatusColor()}`}>
                {daysUntilRenewal < 0
                  ? 'Overdue'
                  : daysUntilRenewal === 0
                  ? 'Today'
                  : daysUntilRenewal === 1
                  ? '1 day'
                  : `${daysUntilRenewal} days`}
              </span>
            </div>
          </div>
        )}

        {/* Cancelled Information */}
        {!isActive && subscription.cancelledAt && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Cancelled on:</span>
              <span className="font-medium text-gray-900">
                {new Date(subscription.cancelledAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600 text-xs mb-1">Monthly Cost</p>
              <p className="font-semibold text-gray-900">
                {formatAmount(subscription.monthlyCost, subscription.currency)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-xs mb-1">Yearly Cost</p>
              <p className="font-semibold text-gray-900">
                {formatAmount(subscription.yearlyCost, subscription.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Auto-renew indicator */}
        {isActive && (
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
            <svg
              className={`w-4 h-4 ${
                subscription.auto_renew ? 'text-green-600' : 'text-gray-400'
              }`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>
              {subscription.auto_renew ? 'Auto-renew enabled' : 'Auto-renew disabled'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-200"
          >
            Edit
          </button>
          <button
            onClick={onCancel}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded transition-colors duration-200 ${
              isActive
                ? 'text-red-700 bg-red-50 hover:bg-red-100'
                : 'text-green-700 bg-green-50 hover:bg-green-100'
            }`}
          >
            {isActive ? 'Cancel' : 'Reactivate'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

SubscriptionCard.propTypes = {
  subscription: PropTypes.shape({
    id: PropTypes.string.isRequired,
    service_name: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    billing_cycle: PropTypes.string.isRequired,
    next_billing_date: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    auto_renew: PropTypes.bool,
    daysUntilRenewal: PropTypes.number,
    monthlyCost: PropTypes.number.isRequired,
    yearlyCost: PropTypes.number.isRequired,
    cancelledAt: PropTypes.instanceOf(Date),
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default SubscriptionCard;
