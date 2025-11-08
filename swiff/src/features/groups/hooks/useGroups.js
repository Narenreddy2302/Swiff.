import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  toggleArchiveGroup,
  getGroupMembers,
  addGroupMember,
  updateMemberRole,
  removeGroupMember,
  leaveGroup,
  getGroupExpenses,
  getExpenseById,
  createGroupExpense,
  updateGroupExpense,
  deleteGroupExpense,
  settleExpenseParticipant,
  getGroupSettlements,
  createGroupSettlement,
  getGroupBalanceSummary,
} from '../../../services/api/groupsService';

// =====================================================
// GROUPS HOOKS
// =====================================================

/**
 * Get all groups for current user
 */
export const useGroups = (userId) => {
  return useQuery({
    queryKey: ['groups', userId],
    queryFn: () => getUserGroups(userId),
    enabled: !!userId,
  });
};

/**
 * Get a single group by ID
 */
export const useGroup = (groupId) => {
  return useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => getGroupById(groupId),
    enabled: !!groupId,
  });
};

/**
 * Create a new group
 */
export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: (data) => {
      // Invalidate groups list
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

/**
 * Update a group
 */
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, updates }) => updateGroup(groupId, updates),
    onSuccess: (data, variables) => {
      // Invalidate specific group and groups list
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

/**
 * Delete a group
 */
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      // Invalidate groups list
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

/**
 * Archive/unarchive a group
 */
export const useToggleArchiveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, isArchived }) => toggleArchiveGroup(groupId, isArchived),
    onSuccess: (data, variables) => {
      // Invalidate specific group and groups list
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

// =====================================================
// GROUP MEMBERS HOOKS
// =====================================================

/**
 * Get all members of a group
 */
export const useGroupMembers = (groupId) => {
  return useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => getGroupMembers(groupId),
    enabled: !!groupId,
  });
};

/**
 * Add a member to a group
 */
export const useAddGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userEmail, role }) => addGroupMember(groupId, userEmail, role),
    onSuccess: (data, variables) => {
      // Invalidate group members and group details
      queryClient.invalidateQueries({ queryKey: ['group-members', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
    },
  });
};

/**
 * Update member role
 */
export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, newRole }) => updateMemberRole(memberId, newRole),
    onSuccess: () => {
      // Invalidate all group members queries
      queryClient.invalidateQueries({ queryKey: ['group-members'] });
    },
  });
};

/**
 * Remove a member from a group
 */
export const useRemoveGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeGroupMember,
    onSuccess: () => {
      // Invalidate all group members queries
      queryClient.invalidateQueries({ queryKey: ['group-members'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

/**
 * Leave a group
 */
export const useLeaveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId }) => leaveGroup(groupId, userId),
    onSuccess: () => {
      // Invalidate groups list
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

// =====================================================
// GROUP EXPENSES HOOKS
// =====================================================

/**
 * Get all expenses for a group
 */
export const useGroupExpenses = (groupId) => {
  return useQuery({
    queryKey: ['group-expenses', groupId],
    queryFn: () => getGroupExpenses(groupId),
    enabled: !!groupId,
  });
};

/**
 * Get a single expense by ID
 */
export const useExpense = (expenseId) => {
  return useQuery({
    queryKey: ['group-expense', expenseId],
    queryFn: () => getExpenseById(expenseId),
    enabled: !!expenseId,
  });
};

/**
 * Create a new group expense
 */
export const useCreateGroupExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseData, participants }) => createGroupExpense(expenseData, participants),
    onSuccess: (data, variables) => {
      // Invalidate group expenses and balances
      queryClient.invalidateQueries({ queryKey: ['group-expenses', variables.expenseData.group_id] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', variables.expenseData.group_id] });
    },
  });
};

/**
 * Update a group expense
 */
export const useUpdateGroupExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseId, updates }) => updateGroupExpense(expenseId, updates),
    onSuccess: (data, variables) => {
      // Invalidate specific expense and expenses list
      queryClient.invalidateQueries({ queryKey: ['group-expense', variables.expenseId] });
      queryClient.invalidateQueries({ queryKey: ['group-expenses'] });
    },
  });
};

/**
 * Delete a group expense
 */
export const useDeleteGroupExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGroupExpense,
    onSuccess: () => {
      // Invalidate all expenses queries and balances
      queryClient.invalidateQueries({ queryKey: ['group-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['group-balances'] });
    },
  });
};

/**
 * Mark expense participant as settled
 */
export const useSettleExpenseParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settleExpenseParticipant,
    onSuccess: () => {
      // Invalidate expenses and balances
      queryClient.invalidateQueries({ queryKey: ['group-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['group-balances'] });
    },
  });
};

// =====================================================
// GROUP SETTLEMENTS HOOKS
// =====================================================

/**
 * Get all settlements for a group
 */
export const useGroupSettlements = (groupId) => {
  return useQuery({
    queryKey: ['group-settlements', groupId],
    queryFn: () => getGroupSettlements(groupId),
    enabled: !!groupId,
  });
};

/**
 * Create a settlement
 */
export const useCreateGroupSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroupSettlement,
    onSuccess: (data, variables) => {
      // Invalidate settlements and balances
      queryClient.invalidateQueries({ queryKey: ['group-settlements', variables.group_id] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', variables.group_id] });
    },
  });
};

/**
 * Get group balance summary
 */
export const useGroupBalanceSummary = (groupId, userId) => {
  return useQuery({
    queryKey: ['group-balances', groupId, userId],
    queryFn: () => getGroupBalanceSummary(groupId, userId),
    enabled: !!groupId && !!userId,
  });
};
