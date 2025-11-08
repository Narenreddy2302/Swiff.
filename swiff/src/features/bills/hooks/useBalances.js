import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserBalances,
  getBalanceWithPerson,
  getSettlementHistory,
  recordSettlement,
  getSuggestedSettlement,
} from '../../../services/api/balancesService';
import { billsKeys } from './useBills';

/**
 * React Query hooks for balance management
 */

// Query keys
export const balanceKeys = {
  all: ['balances'],
  user: (userId) => [...balanceKeys.all, 'user', userId],
  withPerson: (userId, otherEmail) => [...balanceKeys.all, 'person', userId, otherEmail],
  settlements: (userId) => [...balanceKeys.all, 'settlements', userId],
  suggested: (userId, otherEmail) => [...balanceKeys.all, 'suggested', userId, otherEmail],
};

/**
 * Get all balances for current user
 * @param {string} userId - User ID
 */
export const useBalances = (userId) => {
  return useQuery({
    queryKey: balanceKeys.user(userId),
    queryFn: async () => {
      const { data, error } = await getUserBalances(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get balance with a specific person
 * @param {string} userId - Current user ID
 * @param {string} otherEmail - Other person's email
 */
export const useBalanceWithPerson = (userId, otherEmail) => {
  return useQuery({
    queryKey: balanceKeys.withPerson(userId, otherEmail),
    queryFn: async () => {
      const { data, error } = await getBalanceWithPerson(userId, otherEmail);
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!otherEmail,
  });
};

/**
 * Get settlement history
 * @param {string} userId - User ID
 */
export const useSettlementHistory = (userId) => {
  return useQuery({
    queryKey: balanceKeys.settlements(userId),
    queryFn: async () => {
      const { data, error } = await getSettlementHistory(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

/**
 * Get suggested settlement amount
 * @param {string} userId - Current user ID
 * @param {string} otherEmail - Other person's email
 */
export const useSuggestedSettlement = (userId, otherEmail) => {
  return useQuery({
    queryKey: balanceKeys.suggested(userId, otherEmail),
    queryFn: async () => {
      const { data, error } = await getSuggestedSettlement(userId, otherEmail);
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!otherEmail,
  });
};

/**
 * Record a settlement (payment)
 */
export const useRecordSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settlementData) => {
      const { data, error } = await recordSettlement(settlementData);
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate all balance queries for both users
      queryClient.invalidateQueries({ queryKey: balanceKeys.user(variables.payer_email) });
      queryClient.invalidateQueries({ queryKey: balanceKeys.user(variables.payee_email) });
      queryClient.invalidateQueries({ queryKey: balanceKeys.settlements(variables.payer_email) });
      queryClient.invalidateQueries({ queryKey: balanceKeys.settlements(variables.payee_email) });

      // Also invalidate bills lists since settlements affect bill-related balances
      queryClient.invalidateQueries({ queryKey: billsKeys.lists() });
    },
    onError: (error) => {
      console.error('Error recording settlement:', error);
    },
  });
};

export default {
  useBalances,
  useBalanceWithPerson,
  useSettlementHistory,
  useSuggestedSettlement,
  useRecordSettlement,
};
