import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
  getUpcomingRenewals,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  deleteSubscription,
} from '../../../services/api/subscriptionsService';

/**
 * Custom hooks for subscriptions data management using React Query
 * Provides data fetching, caching, and mutations for subscriptions
 */

// Query keys for React Query caching
export const subscriptionsKeys = {
  all: ['subscriptions'],
  lists: () => [...subscriptionsKeys.all, 'list'],
  list: (userId, filters) => [...subscriptionsKeys.lists(), userId, filters],
  details: () => [...subscriptionsKeys.all, 'detail'],
  detail: (id) => [...subscriptionsKeys.details(), id],
  upcoming: (userId, days) => [...subscriptionsKeys.all, 'upcoming', userId, days],
};

/**
 * Hook to fetch all subscriptions for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options (status, category, sortBy, sortOrder)
 */
export function useSubscriptions(userId, options = {}) {
  return useQuery({
    queryKey: subscriptionsKeys.list(userId, options),
    queryFn: () => getSubscriptions(userId, options),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (response) => response.data,
  });
}

/**
 * Hook to fetch a single subscription by ID
 * @param {string} subscriptionId - Subscription ID
 */
export function useSubscription(subscriptionId) {
  return useQuery({
    queryKey: subscriptionsKeys.detail(subscriptionId),
    queryFn: () => getSubscriptionById(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (response) => response.data,
  });
}

/**
 * Hook to fetch upcoming renewals
 * @param {string} userId - User ID
 * @param {number} days - Number of days ahead (default: 7)
 */
export function useUpcomingRenewals(userId, days = 7) {
  return useQuery({
    queryKey: subscriptionsKeys.upcoming(userId, days),
    queryFn: () => getUpcomingRenewals(userId, days),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (response) => response.data,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to create a new subscription
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubscription,
    onSuccess: (response, variables) => {
      // Invalidate and refetch subscriptions list
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.upcoming(variables.user_id) });
    },
    onError: (error) => {
      console.error('Error creating subscription:', error);
    },
  });
}

/**
 * Hook to update a subscription
 */
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subscriptionId, updates }) => updateSubscription(subscriptionId, updates),
    onSuccess: (response, { subscriptionId }) => {
      // Invalidate specific subscription and lists
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.detail(subscriptionId) });
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.upcoming() });
    },
    onError: (error) => {
      console.error('Error updating subscription:', error);
    },
  });
}

/**
 * Hook to cancel a subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: (response, subscriptionId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.detail(subscriptionId) });
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.upcoming() });
    },
    onError: (error) => {
      console.error('Error cancelling subscription:', error);
    },
  });
}

/**
 * Hook to reactivate a subscription
 */
export function useReactivateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subscriptionId, nextBillingDate }) =>
      reactivateSubscription(subscriptionId, nextBillingDate),
    onSuccess: (response, { subscriptionId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.detail(subscriptionId) });
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.upcoming() });
    },
    onError: (error) => {
      console.error('Error reactivating subscription:', error);
    },
  });
}

/**
 * Hook to delete a subscription
 */
export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubscription,
    onSuccess: (response, subscriptionId) => {
      // Invalidate lists and remove subscription from cache
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.upcoming() });
      queryClient.removeQueries({ queryKey: subscriptionsKeys.detail(subscriptionId) });
    },
    onError: (error) => {
      console.error('Error deleting subscription:', error);
    },
  });
}

export default {
  useSubscriptions,
  useSubscription,
  useUpcomingRenewals,
  useCreateSubscription,
  useUpdateSubscription,
  useCancelSubscription,
  useReactivateSubscription,
  useDeleteSubscription,
};
