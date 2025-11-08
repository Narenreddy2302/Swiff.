import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  validatePercentageSplit,
  calculatePercentageSplit,
  formatSplitAmount,
} from '../../../utils/splitCalculations';
import ParticipantChip from './ParticipantChip';
import Input from '../../../components/common/Input/Input';

const PercentageSplit = ({ participants, totalAmount, currency = 'USD', onSplitChange }) => {
  const [percentages, setPercentages] = useState([]);
  const [validation, setValidation] = useState({ isValid: true });
  const [calculatedSplits, setCalculatedSplits] = useState([]);

  // Initialize percentages when participants change
  useEffect(() => {
    const pcts = participants.map((participant) => ({
      participantId: participant.id,
      percentage: '',
    }));
    setPercentages(pcts);
  }, [participants]);

  // Validate and calculate whenever percentages change
  // Note: onSplitChange is intentionally excluded from deps to prevent infinite loops
  // Parent should memoize this callback with useCallback
  useEffect(() => {
    const validationResult = validatePercentageSplit(percentages);
    setValidation(validationResult);

    let freshCalculatedSplits = [];
    if (validationResult.isValid) {
      const splitResult = calculatePercentageSplit(totalAmount, percentages);
      freshCalculatedSplits = splitResult.splits;
      setCalculatedSplits(freshCalculatedSplits);
    } else {
      setCalculatedSplits([]);
    }

    if (onSplitChange) {
      onSplitChange({
        percentages,
        isValid: validationResult.isValid,
        validation: validationResult,
        calculatedSplits: freshCalculatedSplits, // Use fresh value, not stale state
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentages, totalAmount]);

  const handlePercentageChange = (participantId, value) => {
    setPercentages((prev) =>
      prev.map((item) =>
        item.participantId === participantId
          ? { ...item, percentage: value }
          : item
      )
    );
  };

  const calculateTotalPercentage = () => {
    return percentages.reduce((sum, item) => {
      return sum + parseFloat(item.percentage || 0);
    }, 0);
  };

  const getRemainingPercentage = () => {
    return 100 - calculateTotalPercentage();
  };

  const getCalculatedAmount = (participantId) => {
    const split = calculatedSplits.find((s) => s.participantId === participantId);
    return split ? split.amount : 0;
  };

  if (participants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-600">Add participants to assign percentages</p>
      </div>
    );
  }

  const currentTotal = calculateTotalPercentage();
  const remaining = getRemainingPercentage();

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          Assign a percentage to each person. The total must equal{' '}
          <span className="font-semibold">100%</span>
        </p>
      </div>

      {/* Percentage Inputs */}
      <div className="space-y-3">
        {participants.map((participant) => {
          const pct = percentages.find((p) => p.participantId === participant.id);
          const calculatedAmount = getCalculatedAmount(participant.id);

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
              <div className="flex items-center gap-2">
                <div className="w-24">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={pct?.percentage || ''}
                    onChange={(e) => handlePercentageChange(participant.id, e.target.value)}
                    className="text-right"
                  />
                </div>
                <span className="text-gray-600 text-sm font-medium">%</span>
                {validation.isValid && calculatedAmount > 0 && (
                  <div className="w-24 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatSplitAmount(calculatedAmount, currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Running Total */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Current total:</span>
          <span className="font-semibold text-gray-900">{currentTotal.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Target:</span>
          <span className="font-semibold text-gray-900">100%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Remaining:</span>
          <span
            className={`font-semibold ${
              Math.abs(remaining) < 0.1
                ? 'text-green-700'
                : remaining > 0
                ? 'text-orange-700'
                : 'text-red-700'
            }`}
          >
            {remaining.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Calculated Total Amount */}
      {validation.isValid && calculatedSplits.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total calculated amount:</span>
            <span className="font-semibold text-gray-900">
              {formatSplitAmount(
                calculatedSplits.reduce((sum, split) => sum + split.amount, 0),
                currency
              )}
            </span>
          </div>
        </div>
      )}

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
              {validation.remaining && Math.abs(validation.remaining) > 0.1 && (
                <p className="text-xs text-red-700 mt-1">
                  You need to allocate {Math.abs(validation.remaining).toFixed(1)}%{' '}
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
              Percentage split is valid and ready to save
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

PercentageSplit.propTypes = {
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

export default PercentageSplit;
