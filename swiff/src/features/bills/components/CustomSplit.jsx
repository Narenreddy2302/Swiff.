import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { validateCustomSplit, formatSplitAmount } from '../../../utils/splitCalculations';
import ParticipantChip from './ParticipantChip';
import Input from '../../../components/common/Input/Input';

const CustomSplit = ({ participants, totalAmount, currency = 'USD', onSplitChange }) => {
  const [customAmounts, setCustomAmounts] = useState([]);
  const [validation, setValidation] = useState({ isValid: true });

  // Initialize custom amounts when participants change
  useEffect(() => {
    const amounts = participants.map((participant) => ({
      participantId: participant.id,
      amount: '',
    }));
    setCustomAmounts(amounts);
  }, [participants]);

  // Validate and notify parent whenever amounts change
  // Note: onSplitChange is intentionally excluded from deps to prevent infinite loops
  // Parent should memoize this callback with useCallback
  useEffect(() => {
    const validationResult = validateCustomSplit(customAmounts, totalAmount);
    setValidation(validationResult);

    if (onSplitChange) {
      onSplitChange({
        customAmounts,
        isValid: validationResult.isValid,
        validation: validationResult,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customAmounts, totalAmount]);

  const handleAmountChange = (participantId, value) => {
    setCustomAmounts((prev) =>
      prev.map((item) =>
        item.participantId === participantId
          ? { ...item, amount: value }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return customAmounts.reduce((sum, item) => {
      return sum + parseFloat(item.amount || 0);
    }, 0);
  };

  const getRemainingAmount = () => {
    const total = calculateTotal();
    return parseFloat(totalAmount) - total;
  };

  if (participants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-600">Add participants to enter custom amounts</p>
      </div>
    );
  }

  const currentTotal = calculateTotal();
  const remaining = getRemainingAmount();
  const totalAmountNum = parseFloat(totalAmount);

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          Enter a specific amount for each person. The total must equal{' '}
          <span className="font-semibold">{formatSplitAmount(totalAmount, currency)}</span>
        </p>
      </div>

      {/* Amount Inputs */}
      <div className="space-y-3">
        {participants.map((participant) => {
          const amount = customAmounts.find((a) => a.participantId === participant.id);

          return (
            <div
              key={participant.id}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <ParticipantChip
                  participant={participant}
                  canRemove={false}
                  showAmount={false}
                />
              </div>
              <div className="w-40">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount?.amount || ''}
                  onChange={(e) => handleAmountChange(participant.id, e.target.value)}
                  className="text-right"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Running Total */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Current total:</span>
          <span className="font-semibold text-gray-900">
            {formatSplitAmount(currentTotal, currency)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Bill total:</span>
          <span className="font-semibold text-gray-900">
            {formatSplitAmount(totalAmountNum, currency)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Remaining:</span>
          <span
            className={`font-semibold ${
              Math.abs(remaining) < 0.01
                ? 'text-green-700'
                : remaining > 0
                ? 'text-orange-700'
                : 'text-red-700'
            }`}
          >
            {formatSplitAmount(remaining, currency)}
          </span>
        </div>
      </div>

      {/* Validation Messages */}
      {!validation.isValid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p className="text-sm font-medium text-red-900">{validation.error}</p>
              {validation.remaining && Math.abs(validation.remaining) > 0.01 && (
                <p className="text-xs text-red-700 mt-1">
                  You need to allocate {formatSplitAmount(Math.abs(validation.remaining), currency)}{' '}
                  {validation.remaining > 0 ? 'more' : 'less'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {validation.isValid && currentTotal > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
            <p className="text-sm font-medium text-green-900">
              Custom split is valid and ready to save
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

CustomSplit.propTypes = {
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      name: PropTypes.string,
    })
  ).isRequired,
  totalAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currency: PropTypes.string,
  onSplitChange: PropTypes.func,
};

export default CustomSplit;
