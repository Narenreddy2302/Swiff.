import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { formatSplitAmount } from '../../../utils/splitCalculations';

const SplitVisualization = ({ participants, splits, totalAmount, currency = 'USD' }) => {
  if (!splits || splits.length === 0 || participants.length === 0) {
    return null;
  }

  // Calculate percentages for visualization
  const getPercentage = (amount) => {
    return (parseFloat(amount) / parseFloat(totalAmount)) * 100;
  };

  // Get color for participant (consistent with ParticipantChip)
  const getColor = (email) => {
    const colors = [
      { bg: 'bg-blue-500', border: 'border-blue-600' },
      { bg: 'bg-green-500', border: 'border-green-600' },
      { bg: 'bg-purple-500', border: 'border-purple-600' },
      { bg: 'bg-pink-500', border: 'border-pink-600' },
      { bg: 'bg-indigo-500', border: 'border-indigo-600' },
      { bg: 'bg-yellow-500', border: 'border-yellow-600' },
      { bg: 'bg-red-500', border: 'border-red-600' },
      { bg: 'bg-teal-500', border: 'border-teal-600' },
    ];

    const hash = email.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-4">
      {/* Visual Bar Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <h5 className="text-sm font-semibold text-gray-900">Visual Breakdown</h5>

        {/* Stacked Bar */}
        <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden flex">
          {splits.map((split, index) => {
            const participant = participants[index];
            if (!participant) return null;

            const percentage = getPercentage(split.amount || split);
            const colors = getColor(participant.email);

            return (
              <motion.div
                key={participant.id}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${colors.bg} flex items-center justify-center relative group`}
                style={{ minWidth: percentage > 0 ? '2%' : '0%' }}
              >
                {percentage > 10 && (
                  <span className="text-xs font-semibold text-white">
                    {percentage.toFixed(0)}%
                  </span>
                )}

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                  {participant.name || participant.email}: {formatSplitAmount(split.amount || split, currency)}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-gray-200">
          {splits.map((split, index) => {
            const participant = participants[index];
            if (!participant) return null;

            const colors = getColor(participant.email);
            const amount = split.amount || split;
            const percentage = getPercentage(amount);

            return (
              <div key={participant.id} className="flex items-center gap-2">
                <div className={`w-4 h-4 ${colors.bg} rounded border ${colors.border}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {participant.name || participant.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatSplitAmount(amount, currency)}
                  </p>
                  <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistical Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Total</p>
          <p className="text-lg font-bold text-gray-900">
            {formatSplitAmount(totalAmount, currency)}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">People</p>
          <p className="text-lg font-bold text-gray-900">{participants.length}</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Average</p>
          <p className="text-lg font-bold text-gray-900">
            {formatSplitAmount(parseFloat(totalAmount) / participants.length, currency)}
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Largest</p>
          <p className="text-lg font-bold text-gray-900">
            {formatSplitAmount(
              Math.max(...splits.map((s) => parseFloat(s.amount || s))),
              currency
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

SplitVisualization.propTypes = {
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      name: PropTypes.string,
    })
  ).isRequired,
  splits: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        amount: PropTypes.number,
      }),
    ])
  ).isRequired,
  totalAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currency: PropTypes.string,
};

export default SplitVisualization;
