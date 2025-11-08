import PropTypes from 'prop-types';
import { formatSplitAmount, getSplitMethodSummary } from '../../../utils/splitCalculations';

const SplitSummary = ({ splitMethod, participants, totalAmount, currency = 'USD', splitData }) => {
  if (!splitMethod || participants.length === 0) {
    return null;
  }

  const methodSummary = getSplitMethodSummary(splitMethod, participants.length);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">Split Summary</h4>
        <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
          {splitMethod === 'equal' && '⚖️ Equal'}
          {splitMethod === 'custom' && '✏️ Custom'}
          {splitMethod === 'percentage' && '% Percentage'}
        </span>
      </div>

      {/* Method Description */}
      <p className="text-sm text-gray-700">{methodSummary}</p>

      {/* Total Amount */}
      <div className="flex items-center justify-between pt-2 border-t border-blue-200">
        <span className="text-sm font-medium text-gray-700">Total Bill Amount:</span>
        <span className="text-xl font-bold text-gray-900">
          {formatSplitAmount(totalAmount, currency)}
        </span>
      </div>

      {/* Split Details */}
      {splitMethod === 'equal' && splitData?.amountPerPerson && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Per person:</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatSplitAmount(splitData.amountPerPerson, currency)}
          </span>
        </div>
      )}

      {splitMethod === 'custom' && splitData?.isValid && (
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
          <span className="text-sm text-green-700 font-medium">Custom amounts validated</span>
        </div>
      )}

      {splitMethod === 'percentage' && splitData?.isValid && (
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
          <span className="text-sm text-green-700 font-medium">Percentages total 100%</span>
        </div>
      )}

      {/* Warning if not valid */}
      {(splitMethod === 'custom' || splitMethod === 'percentage') &&
       splitData &&
       !splitData.isValid && (
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-orange-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-sm text-orange-700 font-medium">
            Please complete the split details
          </span>
        </div>
      )}
    </div>
  );
};

SplitSummary.propTypes = {
  splitMethod: PropTypes.oneOf(['equal', 'custom', 'percentage']),
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      name: PropTypes.string,
    })
  ).isRequired,
  totalAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currency: PropTypes.string,
  splitData: PropTypes.object,
};

export default SplitSummary;
