import supabase from '../supabase/config';

/**
 * Bills Service - Handles all CRUD operations for bills
 * Uses Supabase for database operations
 */

// ============================================================================
// CREATE Operations
// ============================================================================

/**
 * Create a new bill
 * @param {Object} billData - Bill data
 * @param {string} billData.name - Bill name
 * @param {number} billData.amount - Bill amount
 * @param {string} billData.currency - Currency code (USD, EUR, etc.)
 * @param {string} billData.due_date - Due date (ISO string)
 * @param {string} billData.category - Bill category
 * @param {string} billData.notes - Optional notes
 * @param {boolean} billData.recurring - Is recurring
 * @param {string} billData.frequency - Frequency if recurring
 * @param {string} billData.user_id - User ID
 * @param {boolean} billData.is_split - Is this a split bill
 * @param {string} billData.split_method - Split method (equal, custom, percentage)
 * @param {Array} billData.participants - Participants array
 * @param {Object} billData.split_data - Split calculation data
 * @returns {Promise<{data, error}>}
 */
export const createBill = async (billData) => {
  try {
    // Create the bill first
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert([
        {
          name: billData.name,
          amount: parseFloat(billData.amount),
          currency: billData.currency || 'USD',
          due_date: billData.due_date,
          category: billData.category,
          notes: billData.notes || null,
          recurring: billData.recurring || false,
          frequency: billData.recurring ? billData.frequency : null,
          user_id: billData.user_id,
          paid: false,
          paid_at: null,
          is_split: billData.is_split || false,
          split_method: billData.is_split ? billData.split_method : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (billError) {
      console.error('Error creating bill:', billError);
      return { data: null, error: billError };
    }

    // If it's a split bill, create bill_participants entries
    if (billData.is_split && billData.participants && billData.participants.length > 0) {
      const participantsData = createParticipantsData(
        bill.id,
        billData.participants,
        billData.split_method,
        billData.split_data,
        billData.user_id
      );

      const { error: participantsError } = await supabase
        .from('bill_participants')
        .insert(participantsData);

      if (participantsError) {
        console.error('Error creating bill participants:', participantsError);
        // Delete the bill if participants creation fails
        await supabase.from('bills').delete().eq('id', bill.id);
        return { data: null, error: participantsError };
      }
    }

    return { data: bill, error: null };
  } catch (err) {
    console.error('Exception creating bill:', err);
    return { data: null, error: err };
  }
};

// ============================================================================
// READ Operations
// ============================================================================

/**
 * Get all bills for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category
 * @param {boolean} options.paid - Filter by paid status
 * @param {string} options.sortBy - Sort field (due_date, amount, name)
 * @param {string} options.sortOrder - Sort order (asc, desc)
 * @returns {Promise<{data, error}>}
 */
export const getBills = async (userId, options = {}) => {
  try {
    let query = supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId);

    // Apply filters
    if (options.category) {
      query = query.eq('category', options.category);
    }

    if (options.paid !== undefined) {
      query = query.eq('paid', options.paid);
    }

    // Apply sorting
    const sortBy = options.sortBy || 'due_date';
    const sortOrder = options.sortOrder || 'asc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bills:', error);
      return { data: null, error };
    }

    // Transform data
    const transformedData = data.map(transformBillData);

    return { data: transformedData, error: null };
  } catch (err) {
    console.error('Exception fetching bills:', err);
    return { data: null, error: err };
  }
};

/**
 * Get a single bill by ID
 * @param {string} billId - Bill ID
 * @returns {Promise<{data, error}>}
 */
export const getBillById = async (billId) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('id', billId)
      .single();

    if (error) {
      console.error('Error fetching bill:', error);
      return { data: null, error };
    }

    let transformedData = transformBillData(data);

    // If it's a split bill, fetch participants
    if (data.is_split) {
      const { data: participants, error: participantsError } = await supabase
        .from('bill_participants')
        .select('*')
        .eq('bill_id', billId);

      if (!participantsError && participants) {
        transformedData = {
          ...transformedData,
          participants,
        };
      }
    }

    return { data: transformedData, error: null };
  } catch (err) {
    console.error('Exception fetching bill:', err);
    return { data: null, error: err };
  }
};

/**
 * Get upcoming bills (due in X days)
 * @param {string} userId - User ID
 * @param {number} days - Number of days ahead
 * @returns {Promise<{data, error}>}
 */
export const getUpcomingBills = async (userId, days = 7) => {
  try {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .eq('paid', false)
      .gte('due_date', today.toISOString())
      .lte('due_date', futureDate.toISOString())
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming bills:', error);
      return { data: null, error };
    }

    const transformedData = data.map(transformBillData);

    return { data: transformedData, error: null };
  } catch (err) {
    console.error('Exception fetching upcoming bills:', err);
    return { data: null, error: err };
  }
};

/**
 * Get overdue bills
 * @param {string} userId - User ID
 * @returns {Promise<{data, error}>}
 */
export const getOverdueBills = async (userId) => {
  try {
    const today = new Date().toISOString();

    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .eq('paid', false)
      .lt('due_date', today)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching overdue bills:', error);
      return { data: null, error };
    }

    const transformedData = data.map(transformBillData);

    return { data: transformedData, error: null };
  } catch (err) {
    console.error('Exception fetching overdue bills:', err);
    return { data: null, error: err };
  }
};

// ============================================================================
// UPDATE Operations
// ============================================================================

/**
 * Update a bill
 * @param {string} billId - Bill ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
export const updateBill = async (billId, updates) => {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Format amount if provided
    if (updates.amount !== undefined) {
      updateData.amount = parseFloat(updates.amount);
    }

    const { data, error } = await supabase
      .from('bills')
      .update(updateData)
      .eq('id', billId)
      .select()
      .single();

    if (error) {
      console.error('Error updating bill:', error);
      return { data: null, error };
    }

    const transformedData = transformBillData(data);

    return { data: transformedData, error: null };
  } catch (err) {
    console.error('Exception updating bill:', err);
    return { data: null, error: err };
  }
};

/**
 * Mark a bill as paid
 * @param {string} billId - Bill ID
 * @returns {Promise<{data, error}>}
 */
export const markAsPaid = async (billId) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .update({
        paid: true,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', billId)
      .select()
      .single();

    if (error) {
      console.error('Error marking bill as paid:', error);
      return { data: null, error };
    }

    // If bill is recurring, create next instance
    if (data.recurring && data.frequency) {
      await createNextRecurringBill(data);
    }

    const transformedData = transformBillData(data);

    return { data: transformedData, error: null };
  } catch (err) {
    console.error('Exception marking bill as paid:', err);
    return { data: null, error: err };
  }
};

/**
 * Mark a bill as unpaid
 * @param {string} billId - Bill ID
 * @returns {Promise<{data, error}>}
 */
export const markAsUnpaid = async (billId) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .update({
        paid: false,
        paid_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', billId)
      .select()
      .single();

    if (error) {
      console.error('Error marking bill as unpaid:', error);
      return { data: null, error };
    }

    const transformedData = transformBillData(data);

    return { data: transformedData, error: null };
  } catch (err) {
    console.error('Exception marking bill as unpaid:', err);
    return { data: null, error: err };
  }
};

// ============================================================================
// DELETE Operations
// ============================================================================

/**
 * Delete a bill
 * @param {string} billId - Bill ID
 * @returns {Promise<{data, error}>}
 */
export const deleteBill = async (billId) => {
  try {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', billId);

    if (error) {
      console.error('Error deleting bill:', error);
      return { data: null, error };
    }

    return { data: { success: true, id: billId }, error: null };
  } catch (err) {
    console.error('Exception deleting bill:', err);
    return { data: null, error: err };
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create participants data for bill_participants table
 * @param {string} billId - Bill ID
 * @param {Array} participants - Participants array
 * @param {string} splitMethod - Split method
 * @param {Object} splitData - Split calculation data
 * @param {string} paidByUserId - User ID who paid the bill
 * @returns {Array} Array of participant objects
 */
function createParticipantsData(billId, participants, splitMethod, splitData, paidByUserId) {
  return participants.map((participant, index) => {
    let share = 0;

    // Calculate share based on split method
    if (splitMethod === 'equal' && splitData?.splits) {
      share = splitData.splits[index]?.amount || 0;
    } else if (splitMethod === 'custom' && splitData?.customAmounts) {
      const customAmount = splitData.customAmounts.find(
        (a) => a.participantId === participant.id
      );
      share = parseFloat(customAmount?.amount || 0);
    } else if (splitMethod === 'percentage' && splitData?.calculatedSplits) {
      const percentageSplit = splitData.calculatedSplits.find(
        (s) => s.participantId === participant.id
      );
      share = percentageSplit?.amount || 0;
    }

    return {
      bill_id: billId,
      user_email: participant.email,
      user_name: participant.name || null,
      share: share,
      paid: false,
      paid_amount: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
}

/**
 * Transform bill data from database format
 * Adds calculated fields like daysUntilDue, status, etc.
 */
function transformBillData(bill) {
  const dueDate = new Date(bill.due_date);
  const today = new Date();
  const diffTime = dueDate - today;
  const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determine status
  let status = 'upcoming';
  if (bill.paid) {
    status = 'paid';
  } else if (daysUntilDue < 0) {
    status = 'overdue';
  } else if (daysUntilDue <= 3) {
    status = 'due_soon';
  }

  return {
    ...bill,
    amount: parseFloat(bill.amount), // Return as number, not string
    daysUntilDue,
    status,
    dueDate: dueDate,
    createdAt: new Date(bill.created_at),
    updatedAt: new Date(bill.updated_at),
    paidAt: bill.paid_at ? new Date(bill.paid_at) : null,
  };
}

/**
 * Create next instance of a recurring bill
 * @param {Object} bill - Original bill data
 *
 * IMPORTANT: If the original bill is a split bill, this function will create the next instance
 * with the same split configuration (participants, split method, etc.). This ensures recurring
 * split bills maintain their sharing arrangement across all future instances.
 *
 * NOTE: Participants and split data are fetched from the database to ensure accuracy.
 * If participants have changed their emails or the split configuration needs updating,
 * users should edit the recurring bill template before the next instance is generated.
 */
async function createNextRecurringBill(bill) {
  try {
    const dueDate = new Date(bill.due_date);
    let nextDueDate = new Date(dueDate);

    // Calculate next due date based on frequency
    switch (bill.frequency) {
      case 'weekly':
        nextDueDate.setDate(dueDate.getDate() + 7);
        break;
      case 'monthly':
        nextDueDate.setMonth(dueDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDueDate.setFullYear(dueDate.getFullYear() + 1);
        break;
      default:
        return;
    }

    // Prepare bill data for next instance
    const nextBillData = {
      name: bill.name,
      amount: bill.amount,
      currency: bill.currency,
      due_date: nextDueDate.toISOString(),
      category: bill.category,
      notes: bill.notes,
      recurring: bill.recurring,
      frequency: bill.frequency,
      user_id: bill.user_id,
      is_split: bill.is_split || false,
      split_method: bill.split_method || null,
    };

    // If this is a split bill, fetch and copy participant data
    if (bill.is_split) {
      const { data: participants, error: participantsError } = await supabase
        .from('bill_participants')
        .select('*')
        .eq('bill_id', bill.id);

      if (participantsError) {
        console.error('Error fetching participants for recurring bill:', participantsError);
      } else if (participants && participants.length > 0) {
        // Map participants to the format expected by createBill
        nextBillData.participants = participants.map(p => ({
          id: p.user_email, // Use email as temporary ID
          email: p.user_email,
          name: p.user_name,
        }));

        // Reconstruct split_data based on split method
        if (bill.split_method === 'equal') {
          nextBillData.split_data = {
            splits: participants.map(p => ({
              amount: parseFloat(p.share),
            })),
          };
        } else if (bill.split_method === 'custom') {
          nextBillData.split_data = {
            customAmounts: participants.map(p => ({
              participantId: p.user_email,
              amount: parseFloat(p.share),
            })),
            isValid: true,
          };
        } else if (bill.split_method === 'percentage') {
          // For percentage, we need to reverse-calculate percentages from amounts
          const totalAmount = parseFloat(bill.amount);
          nextBillData.split_data = {
            calculatedSplits: participants.map(p => ({
              participantId: p.user_email,
              amount: parseFloat(p.share),
            })),
            isValid: true,
          };
        }
      }
    }

    // Create new bill instance with all split data
    await createBill(nextBillData);

    console.log('Created next recurring bill instance' + (bill.is_split ? ' (split bill)' : ''));
  } catch (err) {
    console.error('Error creating next recurring bill:', err);
  }
}

/**
 * Search bills by name
 * @param {string} userId - User ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<{data, error}>}
 */
export const searchBills = async (userId, searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${searchTerm}%`)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error searching bills:', error);
      return { data: null, error };
    }

    const transformedData = data.map(transformBillData);

    return { data: transformedData, error: null };
  } catch (err) {
    console.error('Exception searching bills:', err);
    return { data: null, error: err };
  }
};

/**
 * Get bills by date range
 * @param {string} userId - User ID
 * @param {string} startDate - Start date (ISO string)
 * @param {string} endDate - End date (ISO string)
 * @returns {Promise<{data, error}>}
 */
export const getBillsByDateRange = async (userId, startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .gte('due_date', startDate)
      .lte('due_date', endDate)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching bills by date range:', error);
      return { data: null, error };
    }

    const transformedData = data.map(transformBillData);

    return { data: transformedData, error: null };
  } catch (err) {
    console.error('Exception fetching bills by date range:', err);
    return { data: null, error: err };
  }
};

// Export all functions
export default {
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
};
