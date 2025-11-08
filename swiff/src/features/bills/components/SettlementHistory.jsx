import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { formatSplitAmount } from '../../../utils/splitCalculations';
import { formatDistanceToNow } from 'date-fns';

const SettlementHistory = ({ settlements, currentUserEmail }) => {
  if (!settlements || settlements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-card p-12 text-center">
        <div className="text-6xl mb-4">📜</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Settlement History
        </h3>
        <p className="text-gray-600">
          Your settlements will appear here once you start recording payments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Settlement History</h2>

      <div className="space-y-3">
        {settlements.map((settlement, index) => {
          const isPayer = settlement.payer_email === currentUserEmail;
          const otherPerson = isPayer ? settlement.payee_email : settlement.payer_email;
          const otherPersonName = otherPerson.split('@')[0];

          return (
            <motion.div
              key={settlement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                {/* Left side - Person and action */}
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                    isPayer
                      ? 'bg-gradient-to-br from-red-500 to-pink-500'
                      : 'bg-gradient-to-br from-green-500 to-teal-500'
                  }`}>
                    {otherPersonName.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Details */}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {isPayer ? (
                        <>
                          You paid <span className="font-semibold">{otherPersonName}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">{otherPersonName}</span> paid you
                        </>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(settlement.settled_at), { addSuffix: true })}
                      </p>
                      {settlement.notes && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-600 italic">
                            {settlement.notes}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side - Amount */}
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    isPayer ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {isPayer ? '-' : '+'}
                    {formatSplitAmount(settlement.amount, settlement.currency)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(settlement.settled_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-xs font-medium text-green-700">Settled</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Total Paid Out</p>
            <p className="text-lg font-bold text-red-700">
              {formatSplitAmount(
                settlements
                  .filter((s) => s.payer_email === currentUserEmail)
                  .reduce((sum, s) => sum + parseFloat(s.amount), 0),
                'USD'
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Total Received</p>
            <p className="text-lg font-bold text-green-700">
              {formatSplitAmount(
                settlements
                  .filter((s) => s.payee_email === currentUserEmail)
                  .reduce((sum, s) => sum + parseFloat(s.amount), 0),
                'USD'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

SettlementHistory.propTypes = {
  settlements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      payer_email: PropTypes.string.isRequired,
      payee_email: PropTypes.string.isRequired,
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      currency: PropTypes.string.isRequired,
      notes: PropTypes.string,
      settled_at: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
    })
  ),
  currentUserEmail: PropTypes.string.isRequired,
};

export default SettlementHistory;
