import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const GroupCard = ({ group, onArchive, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  // Get user's role in the group
  const userRole = group.group_members?.[0]?.role || 'member';
  const isAdmin = userRole === 'admin';

  // Count members
  const memberCount = group.group_members?.length || 0;

  const handleCardClick = () => {
    navigate(`/groups/${group.id}`);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onArchive) {
      onArchive(group.id, !group.is_archived);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete && window.confirm(`Are you sure you want to delete "${group.name}"? This action cannot be undone.`)) {
      onDelete(group.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      onClick={handleCardClick}
      className={`
        relative bg-white border border-gray-200 rounded-xl p-6
        hover:bg-gray-50 hover:border-gray-300 hover:shadow-md
        transition-all duration-300 cursor-pointer
        ${group.is_archived ? 'opacity-60' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
            {group.is_archived && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                Archived
              </span>
            )}
          </div>
          {group.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
          )}
        </div>

        {/* Menu Button */}
        {isAdmin && (
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                <button
                  onClick={handleArchive}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors duration-200"
                >
                  {group.is_archived ? 'Unarchive Group' : 'Archive Group'}
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors duration-200"
                >
                  Delete Group
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-4">
        {/* Member Count */}
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="text-sm text-gray-700">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>

        {/* Role Badge */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm text-blue-600 font-medium">Admin</span>
            </>
          ) : (
            <span className="text-sm text-gray-600">Member</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Created {formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}</span>
        </div>

        {/* View Details Arrow */}
        <svg
          className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors duration-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Click Overlay for Menu Close */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        />
      )}
    </motion.div>
  );
};

export default GroupCard;
