import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { calculateEqualSplit, formatSplitAmount } from '../../../utils/splitCalculations';
import ParticipantChip from './ParticipantChip';

const EqualSplit = ({ participants, totalAmount, currency = 'USD' }) => {
  const splitData = useMemo(() => {
    return calculateEqualSplit(totalAmount, participants.length);
  }, [totalAmount, participants.length]);

  if (participants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-600">Add participants to see split calculation</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Split Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Amount per person:</span>
          <span className="text-2xl font-bold text-gray-900">
            {formatSplitAmount(splitData.amountPerPerson, currency)}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Split equally among {participants.length} {participants.length === 1 ? 'person' : 'people'}
        </p>
      </div>

      {/* Participant Breakdown */}
      <div className="space-y-2">
        <h5 className="text-sm font-medium text-gray-700">Breakdown:</h5>
        <div className="space-y-2">
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <ParticipantChip
                  participant={participant}
                  canRemove={false}
                  showAmount={false}
                />
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {formatSplitAmount(splitData.splits[index]?.amount || 0, currency)}
                </div>
                {splitData.splits[index]?.amount !== splitData.amountPerPerson && (
                  <p className="text-xs text-gray-500">
                    +{formatSplitAmount(0.01, currency)} adjustment
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Verification */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total allocated:</span>
          <span className="font-semibold text-gray-900">
            {formatSplitAmount(splitData.totalAllocated, currency)}
          </span>
        </div>
        {splitData.totalAllocated === parseFloat(totalAmount) ? (
          <div className="flex items-center gap-2 mt-2 text-xs text-green-700">
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Split matches total amount</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-2 text-xs text-red-700">
            <span>Warning: Total mismatch</span>
          </div>
        )}
      </div>
    </div>
  );
};

EqualSplit.propTypes = {
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      name: PropTypes.string,
    })
  ).isRequired,
  totalAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currency: PropTypes.string,
};

export default EqualSplit;
