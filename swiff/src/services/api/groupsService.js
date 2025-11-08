import { supabase } from '../supabase/config';

// =====================================================
// GROUP CRUD OPERATIONS
// =====================================================

/**
 * Get all groups for the current user
 */
export const getUserGroups = async (userId) => {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      group_members!inner(role),
      created_by_user:users!groups_created_by_fkey(display_name, email)
    `)
    .eq('group_members.user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get a single group by ID with all details
 */
export const getGroupById = async (groupId) => {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      created_by_user:users!groups_created_by_fkey(display_name, email),
      group_members(
        id,
        role,
        joined_at,
        user:users(id, display_name, email)
      )
    `)
    .eq('id', groupId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create a new group
 */
export const createGroup = async (groupData) => {
  const { data, error } = await supabase
    .from('groups')
    .insert([
      {
        name: groupData.name,
        description: groupData.description,
        created_by: groupData.created_by,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update a group
 */
export const updateGroup = async (groupId, updates) => {
  const { data, error } = await supabase
    .from('groups')
    .update({
      name: updates.name,
      description: updates.description,
      is_archived: updates.is_archived,
    })
    .eq('id', groupId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a group
 */
export const deleteGroup = async (groupId) => {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId);

  if (error) throw error;
};

/**
 * Archive/unarchive a group
 */
export const toggleArchiveGroup = async (groupId, isArchived) => {
  const { data, error } = await supabase
    .from('groups')
    .update({ is_archived: isArchived })
    .eq('id', groupId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =====================================================
// GROUP MEMBERS OPERATIONS
// =====================================================

/**
 * Get all members of a group
 */
export const getGroupMembers = async (groupId) => {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      *,
      user:users(id, display_name, email, phone_number)
    `)
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Add a member to a group
 */
export const addGroupMember = async (groupId, userEmail, role = 'member') => {
  // First, get the user ID from email
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (userError) throw new Error('User not found with this email');

  // Then add them to the group
  const { data, error } = await supabase
    .from('group_members')
    .insert([
      {
        group_id: groupId,
        user_id: userData.id,
        role: role,
      },
    ])
    .select(`
      *,
      user:users(id, display_name, email)
    `)
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('User is already a member of this group');
    }
    throw error;
  }
  return data;
};

/**
 * Update a member's role
 */
export const updateMemberRole = async (memberId, newRole) => {
  const { data, error } = await supabase
    .from('group_members')
    .update({ role: newRole })
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Remove a member from a group
 */
export const removeGroupMember = async (memberId) => {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
};

/**
 * Leave a group (remove self)
 */
export const leaveGroup = async (groupId, userId) => {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) throw error;
};

// =====================================================
// GROUP EXPENSES OPERATIONS
// =====================================================

/**
 * Get all expenses for a group
 */
export const getGroupExpenses = async (groupId) => {
  const { data, error } = await supabase
    .from('group_expenses')
    .select(`
      *,
      paid_by_user:users!group_expenses_paid_by_fkey(display_name, email),
      group_expense_participants(
        id,
        user_id,
        amount_owed,
        is_settled,
        user:users(display_name, email)
      )
    `)
    .eq('group_id', groupId)
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get a single expense by ID
 */
export const getExpenseById = async (expenseId) => {
  const { data, error } = await supabase
    .from('group_expenses')
    .select(`
      *,
      paid_by_user:users!group_expenses_paid_by_fkey(display_name, email),
      group_expense_participants(
        id,
        user_id,
        amount_owed,
        is_settled,
        settled_at,
        user:users(display_name, email)
      )
    `)
    .eq('id', expenseId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create a new group expense with participants
 */
export const createGroupExpense = async (expenseData, participants) => {
  // Create the expense
  const { data: expense, error: expenseError } = await supabase
    .from('group_expenses')
    .insert([
      {
        group_id: expenseData.group_id,
        description: expenseData.description,
        amount: expenseData.amount,
        category: expenseData.category,
        paid_by: expenseData.paid_by,
        expense_date: expenseData.expense_date,
        split_type: expenseData.split_type,
        notes: expenseData.notes,
        receipt_url: expenseData.receipt_url,
      },
    ])
    .select()
    .single();

  if (expenseError) throw expenseError;

  // Add participants
  if (participants && participants.length > 0) {
    const participantsData = participants.map((p) => ({
      expense_id: expense.id,
      user_id: p.user_id,
      amount_owed: p.amount_owed,
    }));

    const { error: participantsError } = await supabase
      .from('group_expense_participants')
      .insert(participantsData);

    if (participantsError) throw participantsError;
  }

  return expense;
};

/**
 * Update a group expense
 */
export const updateGroupExpense = async (expenseId, updates) => {
  const { data, error } = await supabase
    .from('group_expenses')
    .update({
      description: updates.description,
      amount: updates.amount,
      category: updates.category,
      expense_date: updates.expense_date,
      notes: updates.notes,
      receipt_url: updates.receipt_url,
    })
    .eq('id', expenseId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a group expense
 */
export const deleteGroupExpense = async (expenseId) => {
  const { error } = await supabase
    .from('group_expenses')
    .delete()
    .eq('id', expenseId);

  if (error) throw error;
};

/**
 * Mark expense participant as settled
 */
export const settleExpenseParticipant = async (participantId) => {
  const { data, error } = await supabase
    .from('group_expense_participants')
    .update({
      is_settled: true,
      settled_at: new Date().toISOString(),
    })
    .eq('id', participantId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =====================================================
// GROUP SETTLEMENTS OPERATIONS
// =====================================================

/**
 * Get all settlements for a group
 */
export const getGroupSettlements = async (groupId) => {
  const { data, error } = await supabase
    .from('group_settlements')
    .select(`
      *,
      from_user:users!group_settlements_from_user_id_fkey(display_name, email),
      to_user:users!group_settlements_to_user_id_fkey(display_name, email)
    `)
    .eq('group_id', groupId)
    .order('settled_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Create a settlement
 */
export const createGroupSettlement = async (settlementData) => {
  const { data, error } = await supabase
    .from('group_settlements')
    .insert([
      {
        group_id: settlementData.group_id,
        from_user_id: settlementData.from_user_id,
        to_user_id: settlementData.to_user_id,
        amount: settlementData.amount,
        notes: settlementData.notes,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get group balance summary for a user
 */
export const getGroupBalanceSummary = async (groupId, userId) => {
  // Get all unsettled expenses where user is a participant
  const { data: expenses, error } = await supabase
    .from('group_expense_participants')
    .select(`
      amount_owed,
      is_settled,
      expense:group_expenses(
        id,
        amount,
        paid_by,
        paid_by_user:users!group_expenses_paid_by_fkey(display_name)
      )
    `)
    .eq('user_id', userId)
    .eq('expense.group_id', groupId)
    .eq('is_settled', false);

  if (error) throw error;

  // Calculate balances
  const balances = {};

  expenses?.forEach((participant) => {
    const paidBy = participant.expense.paid_by;

    // Skip if user paid for themselves
    if (paidBy === userId) return;

    if (!balances[paidBy]) {
      balances[paidBy] = {
        user_id: paidBy,
        user_name: participant.expense.paid_by_user.display_name,
        amount: 0,
      };
    }

    balances[paidBy].amount += parseFloat(participant.amount_owed);
  });

  return Object.values(balances);
};

export default {
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
};
