import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import { formatCurrency } from '../../../utils/formatters';
import { EXPENSE_CATEGORIES } from '../../../utils/constants';

const BillCard = ({ bill, onEdit, onDelete, onMarkAsPaid }) => {
  const navigate = useNavigate();

  // Get category icon and label
  const category = EXPENSE_CATEGORIES.find((cat) => cat.value === bill.category);
  const categoryIcon = category?.icon || '📌';
  const categoryLabel = category?.label || bill.category;

  // Determine status badge color and text
  const getStatusBadge = () => {
    switch (bill.status) {
      case 'paid':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Paid',
        };
      case 'overdue':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Overdue',
        };
      case 'due_soon':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: 'Due Soon',
        };
      default:
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          label: 'Upcoming',
        };
    }
  };

  const statusBadge = getStatusBadge();

  // Format due date message
  const getDueDateMessage = () => {
    if (bill.paid) {
      return `Paid on ${new Date(bill.paid_at).toLocaleDateString()}`;
    }

    if (bill.daysUntilDue < 0) {
      return `${Math.abs(bill.daysUntilDue)} days overdue`;
    } else if (bill.daysUntilDue === 0) {
      return 'Due today';
    } else if (bill.daysUntilDue === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${bill.daysUntilDue} days`;
    }
  };

  const handleCardClick = () => {
    navigate(`/bills/${bill.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        hover
        className={`cursor-pointer ${bill.paid ? 'opacity-75' : ''}`}
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between">
          {/* Left Side: Icon and Info */}
          <div className="flex items-start gap-4 flex-1">
            {/* Category Icon */}
            <div className="text-4xl">{categoryIcon}</div>

            {/* Bill Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`text-lg font-semibold text-gray-900 truncate ${
                    bill.paid ? 'line-through' : ''
                  }`}
                >
                  {bill.name}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${statusBadge.bg} ${statusBadge.text}`}
                >
                  {statusBadge.label}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-2">{categoryLabel}</p>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{getDueDateMessage()}</span>
                {bill.recurring && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    {bill.frequency}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Amount */}
          <div className="text-right ml-4">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(bill.amount, bill.currency)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(bill.due_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="mt-4 pt-4 border-t border-gray-200 flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {!bill.paid && (
            <Button
              size="small"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsPaid(bill.id);
              }}
            >
              Mark as Paid
            </Button>
          )}
          <Button
            size="small"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(bill);
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(bill);
            }}
          >
            Delete
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

BillCard.propTypes = {
  bill: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    currency: PropTypes.string.isRequired,
    due_date: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    paid: PropTypes.bool.isRequired,
    paid_at: PropTypes.string,
    recurring: PropTypes.bool,
    frequency: PropTypes.string,
    daysUntilDue: PropTypes.number.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMarkAsPaid: PropTypes.func.isRequired,
};

export default BillCard;
