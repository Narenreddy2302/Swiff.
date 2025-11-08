import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Button } from '../../../components/common';
import { useAuth } from '../../auth/hooks/useAuth';
import AddBillModal from '../../bills/components/AddBillModal';
import AddSubscriptionModal from '../../subscriptions/components/AddSubscriptionModal';
import AddGroupModal from '../../groups/components/AddGroupModal';
import Loader from '../../../components/common/Loader';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userData, loading } = useAuth();

  // Get user data
  const userId = currentUser?.id;
  const userName = userData?.display_name || currentUser?.email?.split('@')[0] || 'User';

  // Modal states
  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);
  const [isAddSubscriptionModalOpen, setIsAddSubscriptionModalOpen] = useState(false);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);

  // Show loader while fetching user data
  if (loading || !userId) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Swiff</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {userName}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Your Dashboard
            </h2>
            <p className="text-lg text-gray-600">
              Manage your bills, subscriptions, and group expenses all in one place.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <div className="text-center">
                <p className="text-gray-600 mb-2">Total Owed to You</p>
                <p className="text-3xl font-bold text-green-600">$0.00</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-600 mb-2">Total You Owe</p>
                <p className="text-3xl font-bold text-red-600">$0.00</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-600 mb-2">Monthly Subscriptions</p>
                <p className="text-3xl font-bold text-blue-600">$0.00</p>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button fullWidth onClick={() => setIsAddBillModalOpen(true)}>
                Add Bill
              </Button>
              <Button fullWidth variant="secondary" onClick={() => setIsAddSubscriptionModalOpen(true)}>
                Add Subscription
              </Button>
              <Button fullWidth variant="secondary" onClick={() => setIsAddGroupModalOpen(true)}>
                Create Group
              </Button>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => navigate('/bills')}
              >
                View All Bills
              </Button>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => navigate('/groups')}
              >
                View All Groups
              </Button>
            </div>
          </Card>

          {/* Empty State */}
          <Card className="mt-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No transactions yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first bill or subscription
              </p>
              <Button onClick={() => setIsAddBillModalOpen(true)}>
                Get Started
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Modals */}
      <AddBillModal
        isOpen={isAddBillModalOpen}
        onClose={() => setIsAddBillModalOpen(false)}
        userId={userId}
      />
      <AddSubscriptionModal
        isOpen={isAddSubscriptionModalOpen}
        onClose={() => setIsAddSubscriptionModalOpen(false)}
        userId={userId}
      />
      <AddGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={() => setIsAddGroupModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
