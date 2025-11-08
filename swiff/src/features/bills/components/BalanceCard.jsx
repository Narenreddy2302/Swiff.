import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { formatSplitAmount } from '../../../utils/splitCalculations';
import Button from '../../../components/common/Button/Button';

const BalanceCard = ({ balance, onSettleUp, currentUserEmail }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine display based on balance type
  const isOwed = balance.type === 'owed';
  const displayEmail = balance.with;
  const displayName = balance.with.split('@')[0]; // Use email prefix as name for now

  // Get color based on balance type
  const getColorClasses = () => {
    if (isOwed) {
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        accent: 'text-green-700',
        button: 'bg-green-600 hover:bg-green-700',
      };
    } else {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        accent: 'text-red-700',
        button: 'bg-red-600 hover:bg-red-700',
      };
    }
  };

  const colors = getColorClasses();

  // Get avatar initials
  const getInitials = (email) => {
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${colors.bg} border-2 ${colors.border} rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm`}>
            {getInitials(displayEmail)}
          </div>

          {/* Name and email */}
          <div>
            <h3 className={`font-semibold ${colors.text}`}>{displayName}</h3>
            <p className="text-xs text-gray-600">{displayEmail}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right">
          <div className={`text-2xl font-bold ${colors.accent}`}>
            {formatSplitAmount(balance.amount, balance.currency)}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {isOwed ? 'owes you' : 'you owe'}
          </p>
        </div>
      </div>

      {/* Bills involved */}
      {balance.bills && balance.bills.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7"></path>
            </svg>
            <span className="font-medium">
              {balance.bills.length} {balance.bills.length === 1 ? 'bill' : 'bills'}
            </span>
          </button>

          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 space-y-2"
            >
              {balance.bills.map((bill, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{bill.billName}</p>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(bill.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatSplitAmount(bill.amount, balance.currency)}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Breakdown (if both owe each other) */}
      {balance.youOwe > 0 && balance.theyOwe > 0 && (
        <div className="mb-4 p-3 bg-white rounded border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Breakdown:</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">You owe:</span>
              <span className="font-medium text-red-700">
                {formatSplitAmount(balance.youOwe, balance.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">They owe:</span>
              <span className="font-medium text-green-700">
                {formatSplitAmount(balance.theyOwe, balance.currency)}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-200">
              <span className="font-medium text-gray-700">Net:</span>
              <span className={`font-bold ${colors.accent}`}>
                {formatSplitAmount(balance.amount, balance.currency)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action button */}
      <Button
        variant="primary"
        size="small"
        onClick={() => onSettleUp(balance)}
        className="w-full"
      >
        {isOwed ? 'Record Payment' : 'Settle Up'}
      </Button>
    </motion.div>
  );
};

BalanceCard.propTypes = {
  balance: PropTypes.shape({
    with: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['owed', 'owe', 'even']).isRequired,
    currency: PropTypes.string.isRequired,
    bills: PropTypes.arrayOf(
      PropTypes.shape({
        billId: PropTypes.string.isRequired,
        billName: PropTypes.string.isRequired,
        amount: PropTypes.number.isRequired,
        dueDate: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['owe', 'owed']).isRequired,
      })
    ),
    youOwe: PropTypes.number,
    theyOwe: PropTypes.number,
  }).isRequired,
  onSettleUp: PropTypes.func.isRequired,
  currentUserEmail: PropTypes.string.isRequired,
};

export default BalanceCard;
