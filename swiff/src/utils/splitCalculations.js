/**
 * Split Calculations Utility
 * Handles all mathematical operations for bill splitting
 */

/**
 * Calculate equal split among participants
 * @param {number} totalAmount - Total bill amount
 * @param {number} participantCount - Number of people splitting
 * @returns {Object} Split data with amounts per person
 */
export const calculateEqualSplit = (totalAmount, participantCount) => {
  if (participantCount === 0) {
    return { amountPerPerson: 0, splits: [], totalAllocated: 0 };
  }

  const amount = parseFloat(totalAmount);

  // Calculate base amount per person
  const baseAmount = Math.floor((amount * 100) / participantCount) / 100;

  // Calculate remainder to distribute
  const totalBase = baseAmount * participantCount;
  const remainder = Math.round((amount - totalBase) * 100) / 100;

  // Distribute remainder as pennies to first N people
  const pennies = Math.round(remainder * 100);

  const splits = [];
  for (let i = 0; i < participantCount; i++) {
    const extraPenny = i < pennies ? 0.01 : 0;
    splits.push({
      amount: Math.round((baseAmount + extraPenny) * 100) / 100,
    });
  }

  // Verify total matches
  const totalAllocated = splits.reduce((sum, split) => sum + split.amount, 0);

  return {
    amountPerPerson: baseAmount,
    splits,
    totalAllocated: Math.round(totalAllocated * 100) / 100,
  };
};

/**
 * Validate custom split amounts
 * @param {Array} customAmounts - Array of {participantId, amount}
 * @param {number} totalAmount - Total bill amount to match
 * @returns {Object} Validation result with isValid and error message
 */
export const validateCustomSplit = (customAmounts, totalAmount) => {
  const amount = parseFloat(totalAmount);

  // Calculate sum of custom amounts
  const sum = customAmounts.reduce((total, item) => {
    return total + parseFloat(item.amount || 0);
  }, 0);

  const roundedSum = Math.round(sum * 100) / 100;
  const roundedTotal = Math.round(amount * 100) / 100;

  // Allow 1 cent tolerance for rounding
  const difference = Math.abs(roundedSum - roundedTotal);
  const tolerance = 0.01;

  if (difference > tolerance) {
    return {
      isValid: false,
      error: `Total of custom amounts ($${roundedSum.toFixed(2)}) must equal bill total ($${roundedTotal.toFixed(2)})`,
      difference: roundedSum - roundedTotal,
      remaining: roundedTotal - roundedSum,
    };
  }

  // Check for negative or zero amounts
  const hasInvalidAmount = customAmounts.some(item => parseFloat(item.amount || 0) <= 0);
  if (hasInvalidAmount) {
    return {
      isValid: false,
      error: 'All amounts must be greater than zero',
    };
  }

  return {
    isValid: true,
    totalAllocated: roundedSum,
  };
};

/**
 * Calculate split based on percentages
 * @param {number} totalAmount - Total bill amount
 * @param {Array} percentages - Array of {participantId, percentage}
 * @returns {Object} Split data with calculated amounts
 */
export const calculatePercentageSplit = (totalAmount, percentages) => {
  const amount = parseFloat(totalAmount);

  // Calculate amounts based on percentages
  const splits = percentages.map((item) => {
    const percentage = parseFloat(item.percentage || 0);
    const calculatedAmount = Math.round((amount * percentage) / 100 * 100) / 100;

    return {
      participantId: item.participantId,
      percentage,
      amount: calculatedAmount,
    };
  });

  const totalAllocated = splits.reduce((sum, split) => sum + split.amount, 0);
  const roundedTotal = Math.round(totalAllocated * 100) / 100;

  // Adjust for rounding errors - add difference to largest amount
  const difference = Math.round((amount - roundedTotal) * 100) / 100;
  if (Math.abs(difference) > 0 && splits.length > 0) {
    // Find participant with largest amount
    const maxIndex = splits.reduce((maxIdx, split, idx, arr) =>
      split.amount > arr[maxIdx].amount ? idx : maxIdx, 0
    );
    splits[maxIndex].amount = Math.round((splits[maxIndex].amount + difference) * 100) / 100;
  }

  return {
    splits,
    totalAllocated: splits.reduce((sum, split) => sum + split.amount, 0),
  };
};

/**
 * Validate percentage split
 * @param {Array} percentages - Array of {participantId, percentage}
 * @returns {Object} Validation result
 */
export const validatePercentageSplit = (percentages) => {
  // Calculate sum of percentages
  const sum = percentages.reduce((total, item) => {
    return total + parseFloat(item.percentage || 0);
  }, 0);

  const roundedSum = Math.round(sum * 100) / 100;

  // Allow 0.1% tolerance
  const tolerance = 0.1;
  const difference = Math.abs(roundedSum - 100);

  if (difference > tolerance) {
    return {
      isValid: false,
      error: `Total of percentages (${roundedSum.toFixed(1)}%) must equal 100%`,
      difference: roundedSum - 100,
      remaining: 100 - roundedSum,
    };
  }

  // Check for negative or zero percentages
  const hasInvalidPercentage = percentages.some(item => parseFloat(item.percentage || 0) <= 0);
  if (hasInvalidPercentage) {
    return {
      isValid: false,
      error: 'All percentages must be greater than zero',
    };
  }

  // Check for percentages over 100
  const hasOverPercentage = percentages.some(item => parseFloat(item.percentage || 0) > 100);
  if (hasOverPercentage) {
    return {
      isValid: false,
      error: 'Individual percentages cannot exceed 100%',
    };
  }

  return {
    isValid: true,
    totalPercentage: roundedSum,
  };
};

/**
 * Calculate who owes whom based on split
 * @param {Array} participants - Array of {id, name, email, share, paidAmount}
 * @param {string} paidByUserId - ID of user who paid the bill
 * @returns {Array} Array of debt objects {from, to, amount}
 */
export const calculateBalances = (participants, paidByUserId) => {
  const balances = {};

  // Initialize balances for all participants
  participants.forEach(participant => {
    balances[participant.id] = 0;
  });

  // Calculate net balance for each participant
  participants.forEach(participant => {
    const share = parseFloat(participant.share || 0);
    const paidAmount = parseFloat(participant.paidAmount || 0);

    // Positive balance means they are owed, negative means they owe
    balances[participant.id] = paidAmount - share;
  });

  // Create debt array
  const debts = [];
  const creditors = []; // People who are owed money
  const debtors = []; // People who owe money

  Object.entries(balances).forEach(([userId, balance]) => {
    const participant = participants.find(p => p.id === userId);
    if (balance > 0.01) {
      creditors.push({ userId, amount: balance, participant });
    } else if (balance < -0.01) {
      debtors.push({ userId, amount: Math.abs(balance), participant });
    }
  });

  // Simplify debts using greedy algorithm
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const amount = Math.min(creditor.amount, debtor.amount);

    if (amount > 0.01) {
      debts.push({
        from: debtor.participant,
        to: creditor.participant,
        amount: Math.round(amount * 100) / 100,
      });
    }

    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount < 0.01) creditorIndex++;
    if (debtor.amount < 0.01) debtorIndex++;
  }

  return debts;
};

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export const formatSplitAmount = (amount, currency = 'USD') => {
  const value = parseFloat(amount || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Get summary text for split method
 * @param {string} method - Split method (equal, custom, percentage)
 * @param {number} participantCount - Number of participants
 * @returns {string} Summary text
 */
export const getSplitMethodSummary = (method, participantCount) => {
  switch (method) {
    case 'equal':
      return `Split equally among ${participantCount} people`;
    case 'custom':
      return `Custom amounts for ${participantCount} people`;
    case 'percentage':
      return `Percentage-based split among ${participantCount} people`;
    default:
      return 'Split method not specified';
  }
};

export default {
  calculateEqualSplit,
  validateCustomSplit,
  calculatePercentageSplit,
  validatePercentageSplit,
  calculateBalances,
  formatSplitAmount,
  getSplitMethodSummary,
};
