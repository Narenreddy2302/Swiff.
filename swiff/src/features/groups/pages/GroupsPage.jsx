import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import AddGroupModal from '../components/AddGroupModal';
import GroupCard from '../components/GroupCard';
import { useGroups, useDeleteGroup, useToggleArchiveGroup } from '../hooks/useGroups';
import { useAuth } from '../../auth/hooks/useAuth';

const GroupsPage = () => {
  const { currentUser } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Fetch groups
  const { data: groups, isLoading, error } = useGroups(currentUser?.id);
  const deleteGroup = useDeleteGroup();
  const toggleArchiveGroup = useToggleArchiveGroup();

  // Filter groups
  const filteredGroups = useMemo(() => {
    if (!groups) return [];

    let filtered = groups;

    // Filter by archived status
    if (!showArchived) {
      filtered = filtered.filter((group) => !group.is_archived);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (group) =>
          group.name.toLowerCase().includes(query) ||
          group.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [groups, searchQuery, showArchived]);

  const handleAddSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleArchive = async (groupId, isArchived) => {
    try {
      await toggleArchiveGroup.mutateAsync({ groupId, isArchived });
      setSuccessMessage(isArchived ? 'Group archived' : 'Group unarchived');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error archiving group:', error);
      alert('Failed to archive group. Please try again.');
    }
  };

  const handleDelete = async (groupId) => {
    try {
      await deleteGroup.mutateAsync(groupId);
      setSuccessMessage('Group deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Groups</h1>
          <p className="text-gray-600">Manage shared expenses with friends and family</p>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Show Archived Toggle */}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              showArchived
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>

          {/* Add Group Button */}
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Group
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <Loader fullScreen={false} />
        ) : error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Groups</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No groups found' : 'No groups yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Create your first group to start splitting expenses with others'}
            </p>
            {!searchQuery && (
              <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Group
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Add Group Modal */}
        <AddGroupModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddSuccess}
        />
      </div>
    </div>
  );
};

export default GroupsPage;
