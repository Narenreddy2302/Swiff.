import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import { useGroup, useGroupMembers } from '../hooks/useGroups';
import { useAuth } from '../../auth/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

const GroupDetail = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch group data
  const { data: group, isLoading: groupLoading, error: groupError } = useGroup(groupId);
  const { data: members, isLoading: membersLoading } = useGroupMembers(groupId);

  const isLoading = groupLoading || membersLoading;

  // Get user's role
  const userMember = members?.find((m) => m.user_id === currentUser?.id);
  const isAdmin = userMember?.role === 'admin';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'expenses', label: 'Expenses', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'balances', label: 'Balances', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Loader fullScreen={false} />
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Group Not Found</h3>
            <p className="text-gray-600 mb-4">This group may have been deleted or you don't have access to it.</p>
            <Button variant="primary" onClick={() => navigate('/groups')}>
              Back to Groups
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/groups')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Groups
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                {group.is_archived && (
                  <span className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-600 rounded-full">
                    Archived
                  </span>
                )}
              </div>
              {group.description && <p className="text-gray-600 mb-3">{group.description}</p>}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Created {formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}</span>
                <span>•</span>
                <span>{members?.length || 0} members</span>
                {isAdmin && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">You're an admin</span>
                  </>
                )}
              </div>
            </div>

            {isAdmin && (
              <Button variant="secondary" onClick={() => alert('Edit group modal coming soon')}>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Group
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 relative transition-colors duration-200 ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={tab.icon} />
                  </svg>
                  <span className="font-medium">{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab group={group} members={members} isAdmin={isAdmin} />}
            {activeTab === 'expenses' && <ExpensesTab groupId={groupId} />}
            {activeTab === 'balances' && <BalancesTab groupId={groupId} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ group, members, isAdmin }) => {
  return (
    <div className="space-y-6">
      {/* Members Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Members</h3>
          {isAdmin && (
            <Button variant="secondary" size="sm" onClick={() => alert('Add member modal coming soon')}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Member
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {member.user?.display_name?.charAt(0) || member.user?.email?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">{member.user?.display_name || 'Unknown User'}</p>
                  <p className="text-sm text-gray-600">{member.user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {member.role === 'admin' && (
                  <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
                    Admin
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 className="text-gray-600 text-sm font-medium">Total Expenses</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">$0.00</p>
          <p className="text-xs text-gray-500 mt-1">No expenses yet</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-gray-600 text-sm font-medium">Settled</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">$0.00</p>
          <p className="text-xs text-gray-500 mt-1">All caught up</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 className="text-gray-600 text-sm font-medium">Pending</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">$0.00</p>
          <p className="text-xs text-gray-500 mt-1">Nothing pending</p>
        </div>
      </div>
    </div>
  );
};

// Expenses Tab Component (placeholder)
const ExpensesTab = ({ groupId }) => {
  return (
    <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No expenses yet</h3>
      <p className="text-gray-600 mb-6">Start adding expenses to track shared costs</p>
      <Button variant="primary" onClick={() => alert('Add expense modal coming in Phase 4.2')}>
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Expense
      </Button>
    </div>
  );
};

// Balances Tab Component (placeholder)
const BalancesTab = ({ groupId }) => {
  return (
    <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">All settled up!</h3>
      <p className="text-gray-600">No outstanding balances in this group</p>
    </div>
  );
};

export default GroupDetail;
