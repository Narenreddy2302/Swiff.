import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const ParticipantChip = ({ participant, onRemove, canRemove = true, showAmount = false }) => {
  // Get initials from name or email
  const getInitials = () => {
    if (participant.name) {
      return participant.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }
    return participant.email.substring(0, 2).toUpperCase();
  };

  // Generate consistent color based on email
  const getColor = () => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
    ];

    const hash = participant.email.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-full px-3 py-2 shadow-sm"
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full ${getColor()} flex items-center justify-center text-white text-xs font-semibold`}>
        {getInitials()}
      </div>

      {/* Name/Email */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">
          {participant.name || participant.email}
        </span>
        {participant.name && (
          <span className="text-xs text-gray-500">{participant.email}</span>
        )}
        {showAmount && participant.share !== undefined && (
          <span className="text-xs font-medium text-accent-blue">
            ${parseFloat(participant.share).toFixed(2)}
          </span>
        )}
      </div>

      {/* Remove button */}
      {canRemove && onRemove && (
        <button
          onClick={() => onRemove(participant)}
          className="ml-1 text-gray-400 hover:text-red-600 transition-colors"
          aria-label={`Remove ${participant.name || participant.email}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      )}
    </motion.div>
  );
};

ParticipantChip.propTypes = {
  participant: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string.isRequired,
    share: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onRemove: PropTypes.func,
  canRemove: PropTypes.bool,
  showAmount: PropTypes.bool,
};

export default ParticipantChip;
