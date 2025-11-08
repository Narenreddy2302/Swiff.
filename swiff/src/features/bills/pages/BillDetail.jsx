import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Loader from '../../../components/common/Loader/Loader';
import { useBill, useMarkBillAsPaid, useMarkBillAsUnpaid, useDeleteBill } from '../hooks/useBills';
import { formatCurrency } from '../../../utils/formatters';
import { EXPENSE_CATEGORIES } from '../../../utils/constants';

const BillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch bill
  const { data: bill, isLoading, error } = useBill(id);

  // Mutations
  const markAsPaidMutation = useMarkBillAsPaid();
  const markAsUnpaidMutation = useMarkBillAsUnpaid();
  const deleteBillMutation = useDeleteBill();

  // Handlers
  const handleMarkAsPaid = async () => {
    try {
      await markAsPaidMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      alert('Failed to mark bill as paid. Please try again.');
    }
  };

  const handleMarkAsUnpaid = async () => {
    try {
      await markAsUnpaidMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error marking bill as unpaid:', error);
      alert('Failed to mark bill as unpaid. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBillMutation.mutateAsync(id);
      navigate('/bills');
    } catch (error) {
      console.error('Error deleting bill:', error);
      alert('Failed to delete bill. Please try again.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Error state
  if (error || !bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-card p-12 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Bill Not Found</h3>
          <p className="text-gray-600 mb-6">
            The bill you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/bills')}>Back to Bills</Button>
        </div>
      </div>
    );
  }

  // Get category details
  const category = EXPENSE_CATEGORIES.find((cat) => cat.value === bill.category);
  const categoryIcon = category?.icon || '📌';
  const categoryLabel = category?.label || bill.category;

  // Status badge
  const getStatusBadge = () => {
    switch (bill.status) {
      case 'paid':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' };
      case 'overdue':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Overdue' };
      case 'due_soon':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Due Soon' };
      default:
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Upcoming' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/bills')}
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
            <div>
              <p className="text-sm text-gray-600">Dashboard &gt; Bills &gt;</p>
              <h1 className="text-2xl font-bold text-gray-900">{bill.name}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Bill Header Card */}
          <Card className="mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                <div className="text-6xl">{categoryIcon}</div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-gray-900">{bill.name}</h2>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded ${statusBadge.bg} ${statusBadge.text}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>
                  <p className="text-lg text-gray-600 mb-4">{categoryLabel}</p>
                  <div className="flex items-center gap-6 text-gray-600">
                    <div>
                      <span className="font-medium">Due Date:</span>{' '}
                      {new Date(bill.due_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    {bill.recurring && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <span className="capitalize">{bill.frequency}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-gray-900">
                  {formatCurrency(bill.amount, bill.currency)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {bill.paid ? (
                    <>Paid on {new Date(bill.paid_at).toLocaleDateString()}</>
                  ) : bill.daysUntilDue < 0 ? (
                    <span className="text-red-600 font-medium">
                      {Math.abs(bill.daysUntilDue)} days overdue
                    </span>
                  ) : bill.daysUntilDue === 0 ? (
                    <span className="text-yellow-600 font-medium">Due today</span>
                  ) : (
                    <>Due in {bill.daysUntilDue} days</>
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Bill Details Card */}
          <Card className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-lg font-medium text-gray-900">
                  {formatCurrency(bill.amount, bill.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Currency</p>
                <p className="text-lg font-medium text-gray-900">{bill.currency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Category</p>
                <p className="text-lg font-medium text-gray-900">
                  {categoryIcon} {categoryLabel}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-lg font-medium text-gray-900">
                  {bill.paid ? 'Paid' : 'Unpaid'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Created</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(bill.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(bill.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {bill.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Notes</p>
                <p className="text-gray-900">{bill.notes}</p>
              </div>
            )}
          </Card>

          {/* Actions Card */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              {!bill.paid ? (
                <Button
                  onClick={handleMarkAsPaid}
                  disabled={markAsPaidMutation.isPending}
                >
                  {markAsPaidMutation.isPending ? 'Marking as Paid...' : 'Mark as Paid'}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={handleMarkAsUnpaid}
                  disabled={markAsUnpaidMutation.isPending}
                >
                  {markAsUnpaidMutation.isPending ? 'Marking as Unpaid...' : 'Mark as Unpaid'}
                </Button>
              )}
              <Button variant="secondary" onClick={() => navigate(`/bills`)}>
                Edit Bill
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteBillMutation.isPending}
              >
                Delete Bill
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Bill?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{bill.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleteBillMutation.isPending}
              >
                {deleteBillMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BillDetail;
