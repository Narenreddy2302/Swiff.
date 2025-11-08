import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PropTypes from 'prop-types';
import Modal from '../../../components/common/Modal/Modal';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import { useRecordSettlement } from '../hooks/useBalances';
import { formatSplitAmount } from '../../../utils/splitCalculations';

// Zod validation schema
const settlementSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  notes: z.string().optional(),
});

const SettleUpModal = ({ isOpen, onClose, balance, currentUserEmail }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const recordSettlementMutation = useRecordSettlement();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(settlementSchema),
    defaultValues: {
      amount: balance?.amount?.toString() || '',
      notes: '',
    },
  });

  // Set full amount
  const handleSetFullAmount = () => {
    setValue('amount', balance.amount.toString());
  };

  const onSubmit = async (data) => {
    setIsProcessing(true);

    try {
      // Determine payer and payee based on balance type
      const settlementData = {
        payer_email: balance.type === 'owe' ? currentUserEmail : balance.with,
        payee_email: balance.type === 'owe' ? balance.with : currentUserEmail,
        amount: parseFloat(data.amount),
        currency: balance.currency,
        notes: data.notes || null,
      };

      const result = await recordSettlementMutation.mutateAsync(settlementData);

      if (result.error) {
        console.error('Error recording settlement:', result.error);
        alert('Failed to record settlement. Please try again.');
        return;
      }

      // Success - close modal
      reset();
      onClose();

      // Show success message
      alert(`Settlement of ${formatSplitAmount(data.amount, balance.currency)} recorded successfully!`);
    } catch (error) {
      console.error('Exception recording settlement:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!balance) return null;

  const isOwed = balance.type === 'owed';
  const otherPersonName = balance.with.split('@')[0];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Settle Up" size="medium">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Summary */}
        <div className={`p-4 rounded-lg border-2 ${
          isOwed
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {isOwed ? 'They owe you:' : 'You owe them:'}
            </span>
            <span className={`text-2xl font-bold ${
              isOwed ? 'text-green-700' : 'text-red-700'
            }`}>
              {formatSplitAmount(balance.amount, balance.currency)}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {isOwed
              ? `Record a payment received from ${otherPersonName}`
              : `Record a payment you made to ${otherPersonName}`}
          </p>
        </div>

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-800">
              Settlement Amount
            </label>
            <button
              type="button"
              onClick={handleSetFullAmount}
              className="text-xs text-accent-blue hover:text-accent-blue-dark font-medium"
            >
              Use full amount
            </button>
          </div>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            max={balance.amount}
            placeholder="0.00"
            error={!!errors.amount}
            helperText={errors.amount?.message}
            {...register('amount')}
          />
          <p className="text-xs text-gray-600 mt-2">
            You can settle partial amounts. Maximum: {formatSplitAmount(balance.amount, balance.currency)}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows="3"
            placeholder="e.g., Cash payment, Venmo, Bank transfer..."
            className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-accent-blue transition-colors duration-base focus:outline-none bg-white text-gray-900 placeholder-gray-400 resize-none"
          />
        </div>

        {/* Payment Method Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">
                This records a settlement only
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Swiff doesn't process payments. Make the payment through your preferred method (cash, Venmo, etc.) and record it here.
              </p>
            </div>
          </div>
        </div>

        {/* Bills Included */}
        {balance.bills && balance.bills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              Bills included in this balance:
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {balance.bills.map((bill, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <span className="text-sm text-gray-900">{bill.billName}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatSplitAmount(bill.amount, balance.currency)}
                  </span>
                </div>
              ))}
            </div>
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
            disabled={isSubmitting || isProcessing}
          >
            {isSubmitting || isProcessing ? 'Recording...' : 'Record Settlement'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

SettleUpModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  balance: PropTypes.shape({
    with: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['owed', 'owe', 'even']).isRequired,
    currency: PropTypes.string.isRequired,
    bills: PropTypes.arrayOf(
      PropTypes.shape({
        billId: PropTypes.string.isRequired,
        billName: PropTypes.string.isRequired,
        amount: PropTypes.number.isRequired,
        dueDate: PropTypes.string.isRequired,
      })
    ),
  }),
  currentUserEmail: PropTypes.string.isRequired,
};

export default SettleUpModal;
