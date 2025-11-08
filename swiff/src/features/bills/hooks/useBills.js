import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBill,
  getBills,
  getBillById,
  getUpcomingBills,
  getOverdueBills,
  updateBill,
  markAsPaid,
  markAsUnpaid,
  deleteBill,
  searchBills,
  getBillsByDateRange,
} from '../../../services/api/billsService';

/**
 * Custom hooks for bills data management using React Query
 * Provides data fetching, caching, and mutations for bills
 */

// Query keys for React Query caching
export const billsKeys = {
  all: ['bills'],
  lists: () => [...billsKeys.all, 'list'],
  list: (userId, filters) => [...billsKeys.lists(), userId, filters],
  details: () => [...billsKeys.all, 'detail'],
  detail: (id) => [...billsKeys.details(), id],
  upcoming: (userId, days) => [...billsKeys.all, 'upcoming', userId, days],
  overdue: (userId) => [...billsKeys.all, 'overdue', userId],
  search: (userId, term) => [...billsKeys.all, 'search', userId, term],
  dateRange: (userId, start, end) => [...billsKeys.all, 'dateRange', userId, start, end],
};

/**
 * Hook to fetch all bills for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options (category, paid, sortBy, sortOrder)
 */
export function useBills(userId, options = {}) {
  return useQuery({
    queryKey: billsKeys.list(userId, options),
    queryFn: () => getBills(userId, options),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (response) => response.data,
  });
}

/**
 * Hook to fetch a single bill by ID
 * @param {string} billId - Bill ID
 */
export function useBill(billId) {
  return useQuery({
    queryKey: billsKeys.detail(billId),
    queryFn: () => getBillById(billId),
    enabled: !!billId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (response) => response.data,
  });
}

/**
 * Hook to fetch upcoming bills
 * @param {string} userId - User ID
 * @param {number} days - Number of days ahead (default: 7)
 */
export function useUpcomingBills(userId, days = 7) {
  return useQuery({
    queryKey: billsKeys.upcoming(userId, days),
    queryFn: () => getUpcomingBills(userId, days),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (response) => response.data,
  });
}

/**
 * Hook to fetch overdue bills
 * @param {string} userId - User ID
 */
export function useOverdueBills(userId) {
  return useQuery({
    queryKey: billsKeys.overdue(userId),
    queryFn: () => getOverdueBills(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes (refresh more often)
    select: (response) => response.data,
  });
}

/**
 * Hook to search bills
 * @param {string} userId - User ID
 * @param {string} searchTerm - Search term
 */
export function useSearchBills(userId, searchTerm) {
  return useQuery({
    queryKey: billsKeys.search(userId, searchTerm),
    queryFn: () => searchBills(userId, searchTerm),
    enabled: !!userId && searchTerm.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (response) => response.data,
  });
}

/**
 * Hook to get bills by date range
 * @param {string} userId - User ID
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 */
export function useBillsByDateRange(userId, startDate, endDate) {
  return useQuery({
    queryKey: billsKeys.dateRange(userId, startDate, endDate),
    queryFn: () => getBillsByDateRange(userId, startDate, endDate),
    enabled: !!userId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (response) => response.data,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to create a new bill
 */
export function useCreateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBill,
    onSuccess: (response, variables) => {
      // Invalidate and refetch bills list
      queryClient.invalidateQueries({ queryKey: billsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: billsKeys.upcoming(variables.user_id) });
    },
    onError: (error) => {
      console.error('Error creating bill:', error);
    },
  });
}

/**
 * Hook to update a bill
 */
export function useUpdateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ billId, updates }) => updateBill(billId, updates),
    onSuccess: (response, { billId }) => {
      // Invalidate specific bill and lists
      queryClient.invalidateQueries({ queryKey: billsKeys.detail(billId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: billsKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: billsKeys.overdue() });
    },
    onError: (error) => {
      console.error('Error updating bill:', error);
    },
  });
}

/**
 * Hook to mark a bill as paid
 */
export function useMarkBillAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsPaid,
    onSuccess: (response, billId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: billsKeys.detail(billId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: billsKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: billsKeys.overdue() });
    },
    onError: (error) => {
      console.error('Error marking bill as paid:', error);
    },
  });
}

/**
 * Hook to mark a bill as unpaid
 */
export function useMarkBillAsUnpaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsUnpaid,
    onSuccess: (response, billId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: billsKeys.detail(billId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: billsKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: billsKeys.overdue() });
    },
    onError: (error) => {
      console.error('Error marking bill as unpaid:', error);
    },
  });
}

/**
 * Hook to delete a bill
 */
export function useDeleteBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBill,
    onSuccess: (response, billId) => {
      // Invalidate lists and remove bill from cache
      queryClient.invalidateQueries({ queryKey: billsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: billsKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: billsKeys.overdue() });
      queryClient.removeQueries({ queryKey: billsKeys.detail(billId) });
    },
    onError: (error) => {
      console.error('Error deleting bill:', error);
    },
  });
}

// ============================================================================
// Optimistic Update Mutations (for better UX)
// ============================================================================

/**
 * Hook to mark bill as paid with optimistic update
 */
export function useMarkBillAsPaidOptimistic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsPaid,
    onMutate: async (billId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: billsKeys.detail(billId) });

      // Snapshot previous value
      const previousBill = queryClient.getQueryData(billsKeys.detail(billId));

      // Optimistically update
      queryClient.setQueryData(billsKeys.detail(billId), (old) => ({
        ...old,
        data: {
          ...old?.data,
          paid: true,
          paid_at: new Date().toISOString(),
          status: 'paid',
        },
      }));

      return { previousBill };
    },
    onError: (err, billId, context) => {
      // Rollback on error
      queryClient.setQueryData(billsKeys.detail(billId), context.previousBill);
      console.error('Error marking bill as paid:', err);
    },
    onSettled: (response, error, billId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: billsKeys.detail(billId) });
      queryClient.invalidateQueries({ queryKey: billsKeys.lists() });
    },
  });
}

/**
 * Hook to delete bill with optimistic update
 */
export function useDeleteBillOptimistic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBill,
    onMutate: async (billId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: billsKeys.lists() });

      // Snapshot previous value
      const previousBills = queryClient.getQueryData(billsKeys.lists());

      // Optimistically update - remove bill from list
      // Capture billId in local scope to avoid stale closure
      const billIdToDelete = billId;
      queryClient.setQueriesData(billsKeys.lists(), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((bill) => bill.id !== billIdToDelete),
        };
      });

      return { previousBills };
    },
    onError: (err, billId, context) => {
      // Rollback on error
      queryClient.setQueriesData(billsKeys.lists(), context.previousBills);
      console.error('Error deleting bill:', err);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: billsKeys.lists() });
    },
  });
}
