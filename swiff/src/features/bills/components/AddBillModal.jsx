import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PropTypes from 'prop-types';
import Modal from '../../../components/common/Modal/Modal';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import { useCreateBill } from '../hooks/useBills';
import { CURRENCIES, EXPENSE_CATEGORIES, BILLING_CYCLES } from '../../../utils/constants';
import { calculateEqualSplit } from '../../../utils/splitCalculations';
import ParticipantSelector from './ParticipantSelector';
import SplitMethodSelector from './SplitMethodSelector';
import EqualSplit from './EqualSplit';
import CustomSplit from './CustomSplit';
import PercentageSplit from './PercentageSplit';
import SplitSummary from './SplitSummary';
import SplitVisualization from './SplitVisualization';

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
  due_date: z.string().min(1, 'Due date is required').refine(
    (date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    },
    { message: 'Due date cannot be in the past' }
  ),
  category: z.string().min(1, 'Category is required'),
  notes: z.string().optional(),
  recurring: z.boolean().optional(),
  frequency: z.string().optional(),
});

const AddBillModal = ({ isOpen, onClose, userId }) => {
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSplitBill, setIsSplitBill] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [splitMethod, setSplitMethod] = useState('equal');
  const [splitData, setSplitData] = useState(null);
  const createBillMutation = useCreateBill();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
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

  const recurringValue = watch('recurring');
  const amountValue = watch('amount');
  const currencyValue = watch('currency');

  // Participant handlers
  const handleAddParticipant = (participant) => {
    setParticipants((prev) => [...prev, participant]);
  };

  const handleRemoveParticipant = (participantId) => {
    setParticipants((prev) => prev.filter((p) => p.id !== participantId));
  };

  // Split data handler - wrapped in useCallback to prevent infinite loops
  const handleSplitChange = useCallback((data) => {
    setSplitData(data);
  }, []);

  // Calculate equal split automatically
  const getEqualSplitData = () => {
    if (splitMethod === 'equal' && amountValue && participants.length >= 2) {
      return calculateEqualSplit(amountValue, participants.length);
    }
    return null;
  };

  const onSubmit = async (data) => {
    // Validate split bill requirements
    if (isSplitBill) {
      if (participants.length < 2) {
        alert('Please add at least 2 participants for a split bill');
        return;
      }

      if (splitMethod === 'custom' && (!splitData || !splitData.isValid)) {
        alert('Please enter valid custom amounts that total the bill amount');
        return;
      }

      if (splitMethod === 'percentage' && (!splitData || !splitData.isValid)) {
        alert('Please enter valid percentages that total 100%');
        return;
      }
    }

    try {
      // Get final split data based on method
      let finalSplitData = null;
      if (isSplitBill) {
        if (splitMethod === 'equal') {
          finalSplitData = getEqualSplitData();
        } else {
          finalSplitData = splitData;
        }
      }

      const billData = {
        ...data,
        user_id: userId,
        recurring: isRecurring,
        frequency: isRecurring ? data.frequency : null,
        is_split: isSplitBill,
        split_method: isSplitBill ? splitMethod : null,
        participants: isSplitBill ? participants : null,
        split_data: finalSplitData,
      };

      const result = await createBillMutation.mutateAsync(billData);

      if (result.error) {
        console.error('Error creating bill:', result.error);
        alert('Failed to create bill. Please try again.');
        return;
      }

      // Success - close modal and reset form
      reset();
      setIsRecurring(false);
      setIsSplitBill(false);
      setParticipants([]);
      setSplitMethod('equal');
      setSplitData(null);
      onClose();
    } catch (error) {
      console.error('Exception creating bill:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleClose = () => {
    reset();
    setIsRecurring(false);
    setIsSplitBill(false);
    setParticipants([]);
    setSplitMethod('equal');
    setSplitData(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Bill" size="large">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Currency
            </label>
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
              <p className="mt-2 text-sm text-status-danger">
                {errors.currency.message}
              </p>
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
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Category
            </label>
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
              <p className="mt-2 text-sm text-status-danger">
                {errors.category.message}
              </p>
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
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Frequency
            </label>
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

        {/* Split Bill Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isSplitBill}
              onChange={(e) => setIsSplitBill(e.target.checked)}
              className="w-5 h-5 text-accent-red border-gray-300 rounded focus:ring-accent-red"
            />
            <span className="text-sm font-medium text-gray-800">
              Split this bill with others
            </span>
          </label>
          <p className="text-xs text-gray-600 mt-1 ml-8">
            Divide this bill among multiple people
          </p>
        </div>

        {/* Split Bill Section */}
        {isSplitBill && (
          <div className="space-y-6 border-t border-gray-200 pt-6">
            {/* Participants */}
            <ParticipantSelector
              participants={participants}
              onAddParticipant={handleAddParticipant}
              onRemoveParticipant={handleRemoveParticipant}
              currentUserId={userId}
            />

            {/* Split Method */}
            {participants.length >= 2 && amountValue && (
              <>
                <div className="border-t border-gray-200 pt-4">
                  <SplitMethodSelector
                    selectedMethod={splitMethod}
                    onMethodChange={setSplitMethod}
                  />
                </div>

                {/* Split Method UI */}
                <div>
                  {splitMethod === 'equal' && (
                    <EqualSplit
                      participants={participants}
                      totalAmount={amountValue}
                      currency={currencyValue}
                    />
                  )}

                  {splitMethod === 'custom' && (
                    <CustomSplit
                      participants={participants}
                      totalAmount={amountValue}
                      currency={currencyValue}
                      onSplitChange={handleSplitChange}
                    />
                  )}

                  {splitMethod === 'percentage' && (
                    <PercentageSplit
                      participants={participants}
                      totalAmount={amountValue}
                      currency={currencyValue}
                      onSplitChange={handleSplitChange}
                    />
                  )}
                </div>

                {/* Split Summary */}
                <SplitSummary
                  splitMethod={splitMethod}
                  participants={participants}
                  totalAmount={amountValue}
                  currency={currencyValue}
                  splitData={splitData}
                />

                {/* Split Visualization */}
                {splitMethod === 'equal' && getEqualSplitData()?.splits && (
                  <SplitVisualization
                    participants={participants}
                    splits={getEqualSplitData().splits.map((s) => s.amount)}
                    totalAmount={amountValue}
                    currency={currencyValue}
                  />
                )}

                {splitMethod === 'custom' && splitData?.isValid && (
                  <SplitVisualization
                    participants={participants}
                    splits={splitData.customAmounts.map((a) => parseFloat(a.amount || 0))}
                    totalAmount={amountValue}
                    currency={currencyValue}
                  />
                )}

                {splitMethod === 'percentage' && splitData?.isValid && splitData?.calculatedSplits && (
                  <SplitVisualization
                    participants={participants}
                    splits={splitData.calculatedSplits.map((s) => s.amount)}
                    totalAmount={amountValue}
                    currency={currencyValue}
                  />
                )}
              </>
            )}

            {/* Warning if not enough participants or amount */}
            {isSplitBill && participants.length < 2 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Please add at least 2 participants to split this bill
                </p>
              </div>
            )}

            {isSplitBill && !amountValue && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Please enter a bill amount to configure split
                </p>
              </div>
            )}
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
            disabled={isSubmitting || createBillMutation.isPending}
          >
            {isSubmitting || createBillMutation.isPending ? 'Adding...' : 'Add Bill'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

AddBillModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default AddBillModal;
