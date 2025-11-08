import supabase from '../supabase/config';

/**
 * Subscriptions Service - Handles all CRUD operations for personal subscriptions
 * Uses Supabase for database operations
 */

// ============================================================================
// CREATE Operations
// ============================================================================

/**
 * Create a new subscription
 * @param {Object} subscriptionData - Subscription data
 * @param {string} subscriptionData.service_name - Service name (Netflix, Spotify, etc.)
 * @param {number} subscriptionData.amount - Subscription cost
 * @param {string} subscriptionData.currency - Currency code (USD, EUR, etc.)
 * @param {string} subscriptionData.billing_cycle - Billing cycle (weekly, monthly, yearly)
 * @param {string} subscriptionData.next_billing_date - Next billing date (ISO string)
 * @param {string} subscriptionData.category - Category (entertainment, productivity, etc.)
 * @param {boolean} subscriptionData.auto_renew - Auto-renew flag
 * @param {string} subscriptionData.notes - Optional notes
 * @param {string} subscriptionData.icon_url - Optional icon URL
 * @param {string} subscriptionData.user_id - User ID
 * @returns {Promise<{data, error}>}
 */
export const createSubscription = async (subscriptionData) => {
  try {
    const { data, error } = await supabase
      .from('personal_subscriptions')
      .insert([
        {
          service_name: subscriptionData.service_name,
          amount: parseFloat(subscriptionData.amount),
          currency: subscriptionData.currency || 'USD',
          billing_cycle: subscriptionData.billing_cycle,
          next_billing_date: subscriptionData.next_billing_date,
          category: subscriptionData.category,
          auto_renew: subscriptionData.auto_renew !== false, // Default true
          notes: subscriptionData.notes || null,
          icon_url: subscriptionData.icon_url || null,
          user_id: subscriptionData.user_id,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Exception creating subscription:', err);
    return { data: null, error: err };
  }
};

// ============================================================================
// READ Operations
// ============================================================================

/**
 * Get all subscriptions for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by status (active, cancelled, all)
 * @param {string} options.category - Filter by category
 * @param {string} options.sortBy - Sort field (amount, next_billing_date, service_name)
 * @param {string} options.sortOrder - Sort order (asc, desc)
 * @returns {Promise<{data, error}>}
 */
export const getSubscriptions = async (userId, options = {}) => {
  try {
    let query = supabase
      .from('personal_subscriptions')
      .select('*')
      .eq('user_id', userId);

    // Apply filters
    if (options.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    if (options.category) {
      query = query.eq('category', options.category);
    }

    // Apply sorting
    const sortBy = options.sortBy || 'next_billing_date';
    const sortOrder = options.sortOrder === 'desc';
    query = query.order(sortBy, { ascending: !sortOrder });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return { data: null, error };
    }

    // Transform data to add calculated fields
    const transformedData = data.map(transformSubscriptionData);

    return { data: transformedData, error: null };
  } catch (err) {
    console.error('Exception fetching subscriptions:', err);
    return { data: null, error: err };
  }
};

/**
 * Get a single subscription by ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<{data, error}>}
 */
export const getSubscriptionById = async (subscriptionId) => {
  try {
    const { data, error } = await supabase
      .from('personal_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return { data: null, error };
    }

    const transformedData = transformSubscriptionData(data);

    return { data: transformedData, error: null };
  } catch (err) {
    console.error('Exception fetching subscription:', err);
    return { data: null, error: err };
  }
};

/**
 * Get upcoming renewals (subscriptions due in next X days)
 * @param {string} userId - User ID
 * @param {number} days - Number of days ahead (default: 7)
 * @returns {Promise<{data, error}>}
 */
export const getUpcomingRenewals = async (userId, days = 7) => {
  try {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const { data, error } = await supabase
      .from('personal_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('next_billing_date', today.toISOString())
      .lte('next_billing_date', futureDate.toISOString())
      .order('next_billing_date', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming renewals:', error);
      return { data: null, error };
    }

    const transformedData = data.map(transformSubscriptionData);

    return { data: transformedData, error: null };
  } catch (err) {
    console.error('Exception fetching upcoming renewals:', err);
    return { data: null, error: err };
  }
};

// ============================================================================
// UPDATE Operations
// ============================================================================

/**
 * Update a subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
export const updateSubscription = async (subscriptionId, updates) => {
  try {
    const { data, error } = await supabase
      .from('personal_subscriptions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return { data: null, error };
    }

    const transformedData = transformSubscriptionData(data);

    return { data: transformedData, error: null };
  } catch (err) {
    console.error('Exception updating subscription:', err);
    return { data: null, error: err };
  }
};

/**
 * Cancel a subscription (soft delete - keeps in history)
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<{data, error}>}
 */
export const cancelSubscription = async (subscriptionId) => {
  try {
    const { data, error } = await supabase
      .from('personal_subscriptions')
      .update({
        status: 'cancelled',
        auto_renew: false,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling subscription:', error);
      return { data: null, error };
    }

    const transformedData = transformSubscriptionData(data);

    return { data: transformedData, error: null };
  } catch (err) {
    console.error('Exception cancelling subscription:', err);
    return { data: null, error: err };
  }
};

/**
 * Reactivate a cancelled subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {string} nextBillingDate - New next billing date
 * @returns {Promise<{data, error}>}
 */
export const reactivateSubscription = async (subscriptionId, nextBillingDate) => {
  try {
    const { data, error } = await supabase
      .from('personal_subscriptions')
      .update({
        status: 'active',
        auto_renew: true,
        next_billing_date: nextBillingDate,
        cancelled_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Error reactivating subscription:', error);
      return { data: null, error };
    }

    const transformedData = transformSubscriptionData(data);

    return { data: transformedData, error: null };
  } catch (err) {
    console.error('Exception reactivating subscription:', err);
    return { data: null, error: err };
  }
};

// ============================================================================
// DELETE Operations
// ============================================================================

/**
 * Delete a subscription (hard delete - removes from database)
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<{data, error}>}
 */
export const deleteSubscription = async (subscriptionId) => {
  try {
    const { error } = await supabase
      .from('personal_subscriptions')
      .delete()
      .eq('id', subscriptionId);

    if (error) {
      console.error('Error deleting subscription:', error);
      return { data: null, error };
    }

    return { data: { success: true, id: subscriptionId }, error: null };
  } catch (err) {
    console.error('Exception deleting subscription:', err);
    return { data: null, error: err };
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Transform subscription data from database format
 * Adds calculated fields like daysUntilRenewal, monthlyCost, yearlyCost
 */
function transformSubscriptionData(subscription) {
  const nextBillingDate = new Date(subscription.next_billing_date);
  const today = new Date();
  const diffTime = nextBillingDate - today;
  const daysUntilRenewal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Calculate monthly and yearly costs
  let monthlyCost = 0;
  let yearlyCost = 0;
  const amount = parseFloat(subscription.amount);

  switch (subscription.billing_cycle) {
    case 'weekly':
      monthlyCost = amount * 4.33; // Average weeks per month
      yearlyCost = amount * 52;
      break;
    case 'monthly':
      monthlyCost = amount;
      yearlyCost = amount * 12;
      break;
    case 'yearly':
      monthlyCost = amount / 12;
      yearlyCost = amount;
      break;
    default:
      monthlyCost = amount;
      yearlyCost = amount * 12;
  }

  return {
    ...subscription,
    amount: parseFloat(subscription.amount),
    daysUntilRenewal,
    nextBillingDate: nextBillingDate,
    createdAt: new Date(subscription.created_at),
    updatedAt: new Date(subscription.updated_at),
    cancelledAt: subscription.cancelled_at ? new Date(subscription.cancelled_at) : null,
    monthlyCost: Math.round(monthlyCost * 100) / 100,
    yearlyCost: Math.round(yearlyCost * 100) / 100,
  };
}

/**
 * Calculate total costs for all subscriptions
 * @param {Array} subscriptions - Array of subscriptions
 * @returns {Object} - Total monthly and yearly costs
 */
export const calculateTotalCosts = (subscriptions) => {
  const activeSubscriptions = subscriptions.filter((sub) => sub.status === 'active');

  const totalMonthly = activeSubscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0);
  const totalYearly = activeSubscriptions.reduce((sum, sub) => sum + sub.yearlyCost, 0);

  return {
    monthly: Math.round(totalMonthly * 100) / 100,
    yearly: Math.round(totalYearly * 100) / 100,
    count: activeSubscriptions.length,
  };
};

// Export all functions
export default {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
  getUpcomingRenewals,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  deleteSubscription,
  calculateTotalCosts,
};
