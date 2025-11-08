import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSubscriptions, useCancelSubscription, useReactivateSubscription } from '../hooks/useSubscriptions';
import { calculateTotalCosts } from '../../../services/api/subscriptionsService';
import SubscriptionCard from '../components/SubscriptionCard';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import EditSubscriptionModal from '../components/EditSubscriptionModal';
import { SUBSCRIPTION_CATEGORIES } from '../../../utils/constants';
import Loader from '../../../components/common/Loader';

const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const userId = currentUser?.id;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');
  const [sortBy, setSortBy] = useState('next_billing_date');

  // Mutations
  const cancelMutation = useCancelSubscription();
  const reactivateMutation = useReactivateSubscription();

  // Show loader while fetching user data
  if (loading || !userId) {
    return <Loader fullScreen />;
  }

  // Fetch subscriptions with filters
  const { data: subscriptions, isLoading, error } = useSubscriptions(userId, {
    status: filterStatus,
    category: filterCategory !== 'all' ? filterCategory : undefined,
    sortBy,
    sortOrder: 'asc',
  });

  // Calculate totals
  const totals = subscriptions ? calculateTotalCosts(subscriptions) : { monthly: 0, yearly: 0, count: 0 };

  // Get most expensive subscription
  const mostExpensive = subscriptions && subscriptions.length > 0
    ? subscriptions.reduce((max, sub) =>
        sub.status === 'active' && sub.monthlyCost > max.monthlyCost ? sub : max
      , subscriptions.filter(s => s.status === 'active')[0] || subscriptions[0])
    : null;

  const handleEdit = (subscription) => {
    setSelectedSubscription(subscription);
    setIsEditModalOpen(true);
  };

  const handleCancelOrReactivate = async (subscription) => {
    const isActive = subscription.status === 'active';
    const action = isActive ? 'cancel' : 'reactivate';
    const confirmMessage = isActive
      ? `Are you sure you want to cancel "${subscription.service_name}"? You can reactivate it later if needed.`
      : `Reactivate "${subscription.service_name}"? You'll need to confirm the next billing date.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      if (isActive) {
        const result = await cancelMutation.mutateAsync(subscription.id);
        if (result.error) {
          alert('Failed to cancel subscription. Please try again.');
          return;
        }
      } else {
        // For reactivation, we need to prompt for next billing date
        const nextBillingDate = prompt(
          'Enter the next billing date (YYYY-MM-DD):',
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        );

        if (!nextBillingDate) {
          return; // User cancelled
        }

        const result = await reactivateMutation.mutateAsync({
          subscriptionId: subscription.id,
          nextBillingDate,
        });

        if (result.error) {
          alert('Failed to reactivate subscription. Please try again.');
          return;
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing subscription:`, error);
      alert(`An error occurred while ${action}ing the subscription.`);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-card p-12 text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Error Loading Subscriptions
          </h3>
          <p className="text-gray-600 mb-6">
            {error.message || 'Something went wrong. Please try again later.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-accent-red text-white rounded hover:bg-[#C41E24] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-2 bg-accent-red text-white rounded-lg hover:bg-[#C41E24] transition-colors font-medium"
            >
              + Add Subscription
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            {subscriptions && subscriptions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Monthly Cost */}
                <div className="bg-white rounded-lg shadow-card p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700">Monthly Cost</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    ${totals.monthly.toFixed(2)}
                  </p>
                </div>

                {/* Total Yearly Cost */}
                <div className="bg-white rounded-lg shadow-card p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700">Yearly Cost</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    ${totals.yearly.toFixed(2)}
                  </p>
                </div>

                {/* Active Subscriptions */}
                <div className="bg-white rounded-lg shadow-card p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700">Active</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{totals.count}</p>
                </div>

                {/* Most Expensive */}
                <div className="bg-white rounded-lg shadow-card p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700">Most Expensive</h3>
                  </div>
                  <p className="text-xl font-bold text-gray-900 truncate">
                    {mostExpensive ? mostExpensive.service_name : 'N/A'}
                  </p>
                  {mostExpensive && (
                    <p className="text-sm text-gray-600">
                      ${mostExpensive.monthlyCost.toFixed(2)}/mo
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Filters and Sort */}
            <div className="bg-white rounded-lg shadow-card p-4">
              <div className="flex flex-wrap gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:border-accent-blue focus:outline-none bg-white text-gray-900 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="all">All</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:border-accent-blue focus:outline-none bg-white text-gray-900 text-sm"
                  >
                    <option value="all">All Categories</option>
                    {SUBSCRIPTION_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:border-accent-blue focus:outline-none bg-white text-gray-900 text-sm"
                  >
                    <option value="next_billing_date">Next Billing Date</option>
                    <option value="amount">Amount</option>
                    <option value="service_name">Name</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Subscriptions Grid */}
            {subscriptions && subscriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions.map((subscription) => (
                  <SubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                    onEdit={() => handleEdit(subscription)}
                    onCancel={() => handleCancelOrReactivate(subscription)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-card p-12 text-center">
                <div className="text-6xl mb-4">📺</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  No Subscriptions Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start tracking your recurring subscriptions to understand your monthly expenses.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-6 py-3 bg-accent-red text-white rounded hover:bg-[#C41E24] transition-colors"
                >
                  Add Your First Subscription
                </button>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        userId={userId}
      />

      {/* Edit Subscription Modal */}
      <EditSubscriptionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSubscription(null);
        }}
        subscription={selectedSubscription}
        userId={userId}
      />
    </div>
  );
};

export default SubscriptionsPage;
