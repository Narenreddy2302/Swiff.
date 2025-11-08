import supabase from '../supabase/config';

/**
 * Balances Service - Handles balance calculations and settlements
 * Manages who owes whom across all split bills
 */

// ============================================================================
// READ Operations
// ============================================================================

/**
 * Get all balances for a user
 * Calculates net balances across all split bills
 * @param {string} userId - User ID (email for now)
 * @returns {Promise<{data, error}>}
 *
 * TODO: Field naming inconsistency - bill_participants uses 'user_email' but bills uses 'user_id'
 * Both currently store email addresses. Consider standardizing to 'user_email' everywhere
 * or implementing proper user ID system with separate user table.
 */
export const getUserBalances = async (userId) => {
  try {
    // Get all bill participants for this user
    const { data: participants, error: participantsError } = await supabase
      .from('bill_participants')
      .select(`
        *,
        bills (
          id,
          name,
          amount,
          currency,
          due_date,
          user_id,
          paid,
          is_split,
          split_method
        )
      `)
      .eq('user_email', userId);

    if (participantsError) {
      console.error('Error fetching user participants:', participantsError);
      return { data: null, error: participantsError };
    }

    // Get all bills where user is the creator and it's a split bill
    const { data: createdBills, error: createdBillsError } = await supabase
      .from('bills')
      .select(`
        *,
        bill_participants (*)
      `)
      .eq('user_id', userId)
      .eq('is_split', true);

    if (createdBillsError) {
      console.error('Error fetching created bills:', createdBillsError);
      return { data: null, error: createdBillsError };
    }

    // Calculate balances
    const balances = calculateBalancesFromData(userId, participants, createdBills);

    return { data: balances, error: null };
  } catch (err) {
    console.error('Exception fetching user balances:', err);
    return { data: null, error: err };
  }
};

/**
 * Get balance with a specific person
 * @param {string} userId - Current user ID
 * @param {string} otherUserEmail - Other person's email
 * @returns {Promise<{data, error}>}
 */
export const getBalanceWithPerson = async (userId, otherUserEmail) => {
  try {
    const { data: allBalances, error } = await getUserBalances(userId);

    if (error) {
      return { data: null, error };
    }

    // Find balance with specific person
    const balance = allBalances.balances.find(
      (b) => b.with === otherUserEmail
    );

    if (!balance) {
      return {
        data: {
          with: otherUserEmail,
          amount: 0,
          type: 'even',
          currency: 'USD',
          bills: [],
        },
        error: null,
      };
    }

    return { data: balance, error: null };
  } catch (err) {
    console.error('Exception fetching balance with person:', err);
    return { data: null, error: err };
  }
};

/**
 * Get all settlement history for a user
 * @param {string} userId - User ID
 * @returns {Promise<{data, error}>}
 */
export const getSettlementHistory = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .or(`payer_email.eq.${userId},payee_email.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching settlement history:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Exception fetching settlement history:', err);
    return { data: null, error: err };
  }
};

// ============================================================================
// CREATE Operations
// ============================================================================

/**
 * Record a settlement (payment between two people)
 * @param {Object} settlementData - Settlement data
 * @param {string} settlementData.payer_email - Email of person paying
 * @param {string} settlementData.payee_email - Email of person receiving
 * @param {number} settlementData.amount - Amount paid
 * @param {string} settlementData.currency - Currency code
 * @param {string} settlementData.notes - Optional notes
 * @returns {Promise<{data, error}>}
 */
export const recordSettlement = async (settlementData) => {
  try {
    const { data, error } = await supabase
      .from('settlements')
      .insert([
        {
          payer_email: settlementData.payer_email,
          payee_email: settlementData.payee_email,
          amount: parseFloat(settlementData.amount),
          currency: settlementData.currency || 'USD',
          notes: settlementData.notes || null,
          settled_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error recording settlement:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Exception recording settlement:', err);
    return { data: null, error: err };
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate net balances from participants and bills data
 * @param {string} userId - Current user ID
 * @param {Array} participants - Array of bill participants
 * @param {Array} createdBills - Array of bills created by user
 * @returns {Object} Balances object with summary and details
 */
function calculateBalancesFromData(userId, participants, createdBills) {
  const balanceMap = new Map();

  // Process bills where user is a participant
  participants.forEach((participant) => {
    const bill = participant.bills;
    if (!bill || bill.paid) return; // Skip paid bills

    const creatorEmail = bill.user_id;
    const userShare = parseFloat(participant.share);

    // Validate userShare to prevent NaN propagation
    if (isNaN(userShare) || userShare < 0) {
      console.warn(`Invalid share amount for participant in bill ${bill.id}:`, participant.share);
      return;
    }

    // User owes the bill creator
    if (creatorEmail !== userId) {
      const key = creatorEmail;
      if (!balanceMap.has(key)) {
        balanceMap.set(key, {
          with: creatorEmail,
          youOwe: 0,
          theyOwe: 0,
          bills: [],
          currency: bill.currency,
        });
      }

      const balance = balanceMap.get(key);
      balance.youOwe += userShare;
      balance.bills.push({
        billId: bill.id,
        billName: bill.name,
        amount: userShare,
        dueDate: bill.due_date,
        type: 'owe',
      });
    }
  });

  // Process bills created by user (where others owe them)
  createdBills.forEach((bill) => {
    if (bill.paid || !bill.bill_participants) return;

    bill.bill_participants.forEach((participant) => {
      const participantEmail = participant.user_email;
      if (participantEmail === userId) return; // Skip self

      const participantShare = parseFloat(participant.share);

      // Validate participantShare to prevent NaN propagation
      if (isNaN(participantShare) || participantShare < 0) {
        console.warn(`Invalid share amount for participant in bill ${bill.id}:`, participant.share);
        return;
      }

      const key = participantEmail;
      if (!balanceMap.has(key)) {
        balanceMap.set(key, {
          with: participantEmail,
          youOwe: 0,
          theyOwe: 0,
          bills: [],
          currency: bill.currency,
        });
      }

      const balance = balanceMap.get(key);
      balance.theyOwe += participantShare;
      balance.bills.push({
        billId: bill.id,
        billName: bill.name,
        amount: participantShare,
        dueDate: bill.due_date,
        type: 'owed',
      });
    });
  });

  // Calculate net balances
  const balances = Array.from(balanceMap.values()).map((balance) => {
    const netAmount = balance.theyOwe - balance.youOwe;

    return {
      with: balance.with,
      amount: Math.abs(netAmount),
      type: netAmount > 0 ? 'owed' : netAmount < 0 ? 'owe' : 'even',
      currency: balance.currency,
      bills: balance.bills,
      youOwe: balance.youOwe,
      theyOwe: balance.theyOwe,
    };
  });

  // Calculate summary
  const summary = {
    totalOwed: balances
      .filter((b) => b.type === 'owed')
      .reduce((sum, b) => sum + b.amount, 0),
    totalOwe: balances
      .filter((b) => b.type === 'owe')
      .reduce((sum, b) => sum + b.amount, 0),
    netBalance: 0,
  };

  summary.netBalance = summary.totalOwed - summary.totalOwe;

  return {
    summary,
    balances: balances.filter((b) => b.type !== 'even'), // Only show non-zero balances
    allBalances: balances, // Including even balances
  };
}

/**
 * Get suggested settlement amount between two people
 * @param {string} userId - Current user ID
 * @param {string} otherUserEmail - Other person's email
 * @returns {Promise<{data, error}>}
 */
export const getSuggestedSettlement = async (userId, otherUserEmail) => {
  try {
    const { data: balance, error } = await getBalanceWithPerson(userId, otherUserEmail);

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        from: balance.type === 'owe' ? userId : otherUserEmail,
        to: balance.type === 'owe' ? otherUserEmail : userId,
        amount: balance.amount,
        currency: balance.currency,
      },
      error: null,
    };
  } catch (err) {
    console.error('Exception calculating suggested settlement:', err);
    return { data: null, error: err };
  }
};

// Export all functions
export default {
  getUserBalances,
  getBalanceWithPerson,
  getSettlementHistory,
  recordSettlement,
  getSuggestedSettlement,
};
