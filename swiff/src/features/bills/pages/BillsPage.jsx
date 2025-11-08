import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import BillsList from '../components/BillsList';
import AddBillModal from '../components/AddBillModal';
import EditBillModal from '../components/EditBillModal';
import ConfirmDialog from '../../../components/common/ConfirmDialog/ConfirmDialog';
import { useBills, useMarkBillAsPaid, useDeleteBill } from '../hooks/useBills';
import Loader from '../../../components/common/Loader';

const BillsPage = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const userId = currentUser?.id;

  // Modal states
  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);
  const [isEditBillModalOpen, setIsEditBillModalOpen] = useState(false);
  const [billToEdit, setBillToEdit] = useState(null);
  const [billToDelete, setBillToDelete] = useState(null);

  // Show loader while fetching user data
  if (loading || !userId) {
    return <Loader fullScreen />;
  }

  // Fetch bills
  const { data: bills, isLoading, error } = useBills(userId);

  // Mutations
  const markAsPaidMutation = useMarkBillAsPaid();
  const deleteBillMutation = useDeleteBill();

  // Handlers
  const handleAddNew = () => {
    setIsAddBillModalOpen(true);
  };

  const handleEdit = (bill) => {
    setBillToEdit(bill);
    setIsEditBillModalOpen(true);
  };

  const handleDelete = (bill) => {
    setBillToDelete(bill);
  };

  const confirmDelete = async () => {
    if (!billToDelete) return;

    try {
      await deleteBillMutation.mutateAsync(billToDelete.id);
      setBillToDelete(null);
    } catch (error) {
      console.error('Error deleting bill:', error);
      alert('Failed to delete bill. Please try again.');
    }
  };

  const handleMarkAsPaid = async (billId) => {
    try {
      await markAsPaidMutation.mutateAsync(billId);
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      alert('Failed to mark bill as paid. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-card p-12 text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Error Loading Bills
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
            <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BillsList
            bills={bills}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMarkAsPaid={handleMarkAsPaid}
            onAddNew={handleAddNew}
          />
        </motion.div>
      </main>

      {/* Modals */}
      <AddBillModal
        isOpen={isAddBillModalOpen}
        onClose={() => setIsAddBillModalOpen(false)}
        userId={userId}
      />

      <EditBillModal
        isOpen={isEditBillModalOpen}
        onClose={() => {
          setIsEditBillModalOpen(false);
          setBillToEdit(null);
        }}
        bill={billToEdit}
      />

      <ConfirmDialog
        isOpen={!!billToDelete}
        onClose={() => setBillToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Bill?"
        message={`Are you sure you want to delete "${billToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteBillMutation.isPending}
      />
    </div>
  );
};

export default BillsPage;
