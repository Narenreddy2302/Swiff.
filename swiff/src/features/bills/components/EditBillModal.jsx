import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PropTypes from 'prop-types';
import Modal from '../../../components/common/Modal/Modal';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import { useUpdateBill } from '../hooks/useBills';
import { CURRENCIES, EXPENSE_CATEGORIES, BILLING_CYCLES } from '../../../utils/constants';

// Zod validation schema
const billSchema = z.object({
  name: z.string().min(1, 'Bill name is required').max(100, 'Bill name must be less than 100 characters'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  currency: z.string().min(1, 'Currency is required'),
  due_date: z.string().min(1, 'Due date is required'),
  category: z.string().min(1, 'Category is required'),
  notes: z.string().optional(),
  recurring: z.boolean().optional(),
  frequency: z.string().optional(),
});

const EditBillModal = ({ isOpen, onClose, bill }) => {
  const [isRecurring, setIsRecurring] = useState(false);
  const updateBillMutation = useUpdateBill();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(billSchema),
    defaultValues: {
      name: '',
      amount: '',
      currency: 'USD',
      due_date: '',
      category: 'utilities',
      notes: '',
      recurring: false,
      frequency: 'monthly',
    },
  });

  // Update form when bill changes
  useEffect(() => {
    if (bill) {
      const dueDate = new Date(bill.due_date);
      const formattedDate = dueDate.toISOString().split('T')[0];

      reset({
        name: bill.name,
        amount: String(bill.amount),
        currency: bill.currency,
        due_date: formattedDate,
        category: bill.category,
        notes: bill.notes || '',
        recurring: bill.recurring || false,
        frequency: bill.frequency || 'monthly',
      });
      setIsRecurring(bill.recurring || false);
    }
  }, [bill, reset]);

  const onSubmit = async (data) => {
    try {
      const updates = {
        name: data.name,
        amount: parseFloat(data.amount),
        currency: data.currency,
        due_date: data.due_date,
        category: data.category,
        notes: data.notes || null,
        recurring: isRecurring,
        frequency: isRecurring ? data.frequency : null,
      };

      const result = await updateBillMutation.mutateAsync({
        billId: bill.id,
        updates,
      });

      if (result.error) {
        console.error('Error updating bill:', result.error);
        alert('Failed to update bill. Please try again.');
        return;
      }

      // Success - close modal
      onClose();
    } catch (error) {
      console.error('Exception updating bill:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleClose = () => {
    reset();
    setIsRecurring(false);
    onClose();
  };

  if (!bill) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Bill" size="medium">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Split Bill Warning */}
        {bill.is_split && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Limited editing for split bills
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This is a split bill. You can only edit basic information (name, due date, category, notes).
                    Changing the amount or participants will affect existing balances and settlements.
                  </p>
                  <p className="mt-1 font-semibold">
                    To modify the split, please delete this bill and create a new one.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bill Name */}
        <div>
          <Input
            label="Bill Name"
            type="text"
            placeholder="e.g., Electric Bill, Rent"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name')}
          />
        </div>

        {/* Amount and Currency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              error={!!errors.amount}
              helperText={errors.amount?.message}
              {...register('amount')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Currency</label>
            <select
              {...register('currency')}
              className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-accent-blue transition-colors duration-base focus:outline-none bg-white text-gray-900"
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
            {errors.currency && (
              <p className="mt-2 text-sm text-status-danger">{errors.currency.message}</p>
            )}
          </div>
        </div>

        {/* Due Date and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Due Date"
              type="date"
              error={!!errors.due_date}
              helperText={errors.due_date?.message}
              {...register('due_date')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Category</label>
            <select
              {...register('category')}
              className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-accent-blue transition-colors duration-base focus:outline-none bg-white text-gray-900"
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-2 text-sm text-status-danger">{errors.category.message}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows="3"
            placeholder="Add any additional notes..."
            className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-accent-blue transition-colors duration-base focus:outline-none bg-white text-gray-900 placeholder-gray-400 resize-none"
          />
        </div>

        {/* Recurring Bill */}
        <div className="border-t border-gray-200 pt-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('recurring')}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-5 h-5 text-accent-red border-gray-300 rounded focus:ring-accent-red"
            />
            <span className="text-sm font-medium text-gray-800">
              This is a recurring bill
            </span>
          </label>
        </div>

        {/* Frequency (shown only if recurring) */}
        {isRecurring && (
          <div className="pl-8">
            <label className="block text-sm font-medium text-gray-800 mb-2">Frequency</label>
            <select
              {...register('frequency')}
              className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-accent-blue transition-colors duration-base focus:outline-none bg-white text-gray-900"
            >
              {BILLING_CYCLES.map((cycle) => (
                <option key={cycle.value} value={cycle.value}>
                  {cycle.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || updateBillMutation.isPending}
          >
            {isSubmitting || updateBillMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

EditBillModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bill: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    currency: PropTypes.string.isRequired,
    due_date: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    notes: PropTypes.string,
    recurring: PropTypes.bool,
    frequency: PropTypes.string,
  }),
};

export default EditBillModal;
