import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useBalances } from '../hooks/useBalances';
import BalanceCard from '../components/BalanceCard';
import SettleUpModal from '../components/SettleUpModal';
import { formatSplitAmount } from '../../../utils/splitCalculations';
import Loader from '../../../components/common/Loader';

const BalancesPage = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const userId = currentUser?.id;
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [isSettleUpModalOpen, setIsSettleUpModalOpen] = useState(false);

  // Show loader while fetching user data
  if (loading || !userId) {
    return <Loader fullScreen />;
  }

  // Fetch balances
  const { data: balancesData, isLoading, error } = useBalances(userId);

  const handleSettleUp = (balance) => {
    setSelectedBalance(balance);
    setIsSettleUpModalOpen(true);
  };

  const handleCloseSettleUpModal = () => {
    setSelectedBalance(null);
    setIsSettleUpModalOpen(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-card p-12 text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Error Loading Balances
          </h3>
          <p className="text-gray-600 mb-6">
            {error.message || 'Something went wrong. Please try again later.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-accent-red text-white rounded hover:bg-[#C41E24] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Balances</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            {balancesData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Owed to You */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 4v16m8-8H4"></path>
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700">You Are Owed</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-700">
                    {formatSplitAmount(balancesData.summary.totalOwed, 'USD')}
                  </p>
                </div>

                {/* Total You Owe */}
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M20 12H4"></path>
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700">You Owe</h3>
                  </div>
                  <p className="text-3xl font-bold text-red-700">
                    {formatSplitAmount(balancesData.summary.totalOwe, 'USD')}
                  </p>
                </div>

                {/* Net Balance */}
                <div className={`border-2 rounded-lg p-6 ${
                  balancesData.summary.netBalance > 0
                    ? 'bg-blue-50 border-blue-200'
                    : balancesData.summary.netBalance < 0
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      balancesData.summary.netBalance > 0
                        ? 'bg-blue-500'
                        : balancesData.summary.netBalance < 0
                        ? 'bg-orange-500'
                        : 'bg-gray-500'
                    }`}>
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700">Net Balance</h3>
                  </div>
                  <p className={`text-3xl font-bold ${
                    balancesData.summary.netBalance > 0
                      ? 'text-blue-700'
                      : balancesData.summary.netBalance < 0
                      ? 'text-orange-700'
                      : 'text-gray-700'
                  }`}>
                    {balancesData.summary.netBalance >= 0 ? '+' : ''}
                    {formatSplitAmount(Math.abs(balancesData.summary.netBalance), 'USD')}
                  </p>
                </div>
              </div>
            )}

            {/* Balances List */}
            {balancesData && balancesData.balances.length > 0 ? (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Individual Balances
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {balancesData.balances.map((balance, index) => (
                    <BalanceCard
                      key={index}
                      balance={balance}
                      onSettleUp={handleSettleUp}
                      currentUserEmail={userId}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  No Outstanding Balances
                </h3>
                <p className="text-gray-600 mb-6">
                  You're all settled up! Create split bills to track expenses with friends.
                </p>
                <button
                  onClick={() => navigate('/bills')}
                  className="px-6 py-3 bg-accent-red text-white rounded hover:bg-[#C41E24] transition-colors"
                >
                  Go to Bills
                </button>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Settle Up Modal */}
      {selectedBalance && (
        <SettleUpModal
          isOpen={isSettleUpModalOpen}
          onClose={handleCloseSettleUpModal}
          balance={selectedBalance}
          currentUserEmail={userId}
        />
      )}
    </div>
  );
};

export default BalancesPage;
