import { useState } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence } from 'framer-motion';
import ParticipantChip from './ParticipantChip';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';

const ParticipantSelector = ({ participants, onAddParticipant, onRemoveParticipant, currentUserId }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddParticipant = () => {
    setError('');

    // Validate email
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    // Check if already added
    const emailLower = email.trim().toLowerCase();
    const alreadyAdded = participants.some(
      p => p.email.toLowerCase() === emailLower
    );

    if (alreadyAdded) {
      setError('This person is already added');
      return;
    }

    // Create participant object
    const newParticipant = {
      id: `temp-${Date.now()}`, // Temporary ID
      email: email.trim(),
      name: name.trim() || null,
    };

    onAddParticipant(newParticipant);

    // Reset form
    setEmail('');
    setName('');
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddParticipant();
    }
  };

  return (
    <div className="space-y-4">
      {/* Participant count */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">
          Split between {participants.length} {participants.length === 1 ? 'person' : 'people'}
        </h4>
        {participants.length < 2 && (
          <span className="text-xs text-red-600">Add at least one more person</span>
        )}
      </div>

      {/* Add participant form */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            placeholder="friend@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            error={!!error}
            helperText={error}
          />
          <Input
            label="Name (Optional)"
            type="text"
            placeholder="Friend's name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <Button
          onClick={handleAddParticipant}
          variant="secondary"
          size="small"
          className="w-full md:w-auto"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 4v16m8-8H4"></path>
          </svg>
          Add Participant
        </Button>
      </div>

      {/* Selected participants */}
      {participants.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Selected Participants:</h4>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {participants.map((participant) => (
                <ParticipantChip
                  key={participant.id}
                  participant={participant}
                  onRemove={
                    participant.id !== currentUserId
                      ? onRemoveParticipant
                      : null
                  }
                  canRemove={participant.id !== currentUserId}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Helper text */}
          <p className="text-xs text-gray-500">
            You cannot remove yourself from the split
          </p>
        </div>
      )}

      {/* Empty state */}
      {participants.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">No participants added yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Add people to split this bill with
          </p>
        </div>
      )}
    </div>
  );
};

ParticipantSelector.propTypes = {
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      name: PropTypes.string,
    })
  ).isRequired,
  onAddParticipant: PropTypes.func.isRequired,
  onRemoveParticipant: PropTypes.func.isRequired,
  currentUserId: PropTypes.string.isRequired,
};

export default ParticipantSelector;
