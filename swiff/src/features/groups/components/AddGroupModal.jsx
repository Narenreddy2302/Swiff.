import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useCreateGroup } from '../hooks/useGroups';
import { useAuth } from '../../auth/hooks/useAuth';

// Validation schema
const groupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

const AddGroupModal = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createGroup = useCreateGroup();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const groupData = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        created_by: currentUser.id,
      };

      await createGroup.mutateAsync(groupData);

      // Show success message
      if (onSuccess) {
        onSuccess('Group created successfully!');
      }

      handleClose();
    } catch (error) {
      console.error('Error creating group:', error);
      alert(error.message || 'Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Group" size="large">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Group Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Group Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., Roommates, Trip to Paris, Office Lunch"
            {...register('name')}
            error={errors.name?.message}
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Add details about this group..."
            {...register('description')}
            className={`
              w-full px-4 py-3 rounded-lg
              bg-white/5 border border-white/10
              text-white placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
              transition-all duration-200
              resize-none
              ${errors.description ? 'border-red-500' : ''}
            `}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">You'll be the group admin</p>
              <p className="text-blue-300/80">
                You can add members, create expenses, and manage the group after it's created.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddGroupModal;
