import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PropTypes from 'prop-types';
import Modal from '../../../components/common/Modal/Modal';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import { useUpdateSubscription } from '../hooks/useSubscriptions';
import { CURRENCIES, BILLING_CYCLES, SUBSCRIPTION_CATEGORIES } from '../../../utils/constants';

// Zod validation schema
const subscriptionSchema = z.object({
  service_name: z
    .string()
    .min(1, 'Service name is required')
    .max(100, 'Service name must be less than 100 characters'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  currency: z.string().min(1, 'Currency is required'),
  billing_cycle: z.string().min(1, 'Billing cycle is required'),
  next_billing_date: z.string().min(1, 'Next billing date is required').refine(
    (date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    },
    { message: 'Next billing date cannot be in the past' }
  ),
  category: z.string().min(1, 'Category is required'),
  auto_renew: z.boolean().optional(),
  notes: z.string().optional(),
});

const EditSubscriptionModal = ({ isOpen, onClose, subscription, userId }) => {
  const updateSubscriptionMutation = useUpdateSubscription();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      service_name: '',
      amount: '',
      currency: 'USD',
      billing_cycle: 'monthly',
      next_billing_date: '',
      category: 'streaming',
      auto_renew: true,
      notes: '',
    },
  });

  // Update form values when subscription prop changes
  useEffect(() => {
    if (subscription && isOpen) {
      reset({
        service_name: subscription.service_name,
        amount: subscription.amount.toString(),
        currency: subscription.currency,
        billing_cycle: subscription.billing_cycle,
        next_billing_date: subscription.next_billing_date,
        category: subscription.category,
        auto_renew: subscription.auto_renew !== false,
        notes: subscription.notes || '',
      });
    }
  }, [subscription, isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      const updates = {
        ...data,
        user_id: userId,
      };

      const result = await updateSubscriptionMutation.mutateAsync({
        subscriptionId: subscription.id,
        updates,
      });

      if (result.error) {
        console.error('Error updating subscription:', result.error);
        alert('Failed to update subscription. Please try again.');
        return;
      }

      // Success - close modal and reset form
      reset();
      onClose();
    } catch (error) {
      console.error('Exception updating subscription:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Subscription" size="large">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Service Name */}
        <div>
          <Input
            label="Service Name"
            type="text"
            placeholder="e.g., Netflix, Spotify, Adobe"
            error={!!errors.service_name}
            helperText={errors.service_name?.message}
            {...register('service_name')}
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

        {/* Billing Cycle and Next Billing Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Billing Cycle
            </label>
            <select
              {...register('billing_cycle')}
              className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-accent-blue transition-colors duration-base focus:outline-none bg-white text-gray-900"
            >
              {BILLING_CYCLES.map((cycle) => (
                <option key={cycle.value} value={cycle.value}>
                  {cycle.label}
                </option>
              ))}
            </select>
            {errors.billing_cycle && (
              <p className="mt-2 text-sm text-status-danger">
                {errors.billing_cycle.message}
              </p>
            )}
            {!errors.billing_cycle && (
              <p className="text-xs text-gray-600 mt-1">
                This determines how often you'll be charged
              </p>
            )}
          </div>

          <div>
            <Input
              label="Next Billing Date"
              type="date"
              error={!!errors.next_billing_date}
              helperText={errors.next_billing_date?.message}
              {...register('next_billing_date')}
            />
            {!errors.next_billing_date && (
              <p className="text-xs text-gray-600 mt-1">
                When your next payment is due
              </p>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Category
          </label>
          <select
            {...register('category')}
            className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-accent-blue transition-colors duration-base focus:outline-none bg-white text-gray-900"
          >
            {SUBSCRIPTION_CATEGORIES.map((category) => (
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
          {!errors.category && (
            <p className="text-xs text-gray-600 mt-1">
              Helps organize and track your subscriptions
            </p>
          )}
        </div>

        {/* Auto-renew */}
        <div className="border-t border-gray-200 pt-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('auto_renew')}
              className="w-5 h-5 text-accent-red border-gray-300 rounded focus:ring-accent-red"
            />
            <span className="text-sm font-medium text-gray-800">
              Auto-renew this subscription
            </span>
          </label>
          <p className="text-xs text-gray-600 mt-1 ml-8">
            Automatically track renewal dates and update costs
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
            placeholder="Add any additional notes about this subscription..."
            className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-accent-blue transition-colors duration-base focus:outline-none bg-white text-gray-900 placeholder-gray-400 resize-none"
          />
        </div>

        {/* Info Box */}
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
                Update Subscription Details
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Changes will update your renewal tracking and monthly/yearly cost calculations. Your subscription history will be preserved.
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || updateSubscriptionMutation.isPending}
          >
            {isSubmitting || updateSubscriptionMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

EditSubscriptionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subscription: PropTypes.object,
  userId: PropTypes.string.isRequired,
};

export default EditSubscriptionModal;
