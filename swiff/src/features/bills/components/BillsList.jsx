import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import BillCard from './BillCard';
import Button from '../../../components/common/Button/Button';
import Loader from '../../../components/common/Loader/Loader';
import { EXPENSE_CATEGORIES } from '../../../utils/constants';

const BillsList = ({ bills, isLoading, onEdit, onDelete, onMarkAsPaid, onAddNew }) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('due_date');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter bills
  const filteredBills = bills?.filter((bill) => {
    // Category filter
    if (filterCategory !== 'all' && bill.category !== filterCategory) {
      return false;
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'paid' && !bill.paid) return false;
      if (filterStatus === 'unpaid' && bill.paid) return false;
      if (filterStatus === 'overdue' && bill.status !== 'overdue') return false;
    }

    // Search filter
    if (searchTerm && !bill.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Sort bills
  const sortedBills = filteredBills?.sort((a, b) => {
    switch (sortBy) {
      case 'due_date':
        return new Date(a.due_date) - new Date(b.due_date);
      case 'amount':
        return parseFloat(b.amount) - parseFloat(a.amount);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader />
      </div>
    );
  }

  // Empty state - no bills at all
  if (!bills || bills.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-card p-12 text-center">
        <div className="text-6xl mb-4">💵</div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No bills yet</h3>
        <p className="text-gray-600 mb-6">
          Get started by adding your first bill to track your expenses
        </p>
        <Button onClick={onAddNew}>Add Your First Bill</Button>
      </div>
    );
  }

  // Empty state - no bills match filters
  if (sortedBills.length === 0) {
    return (
      <div>
        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-accent-blue transition-colors focus:outline-none bg-white text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-accent-blue transition-colors focus:outline-none bg-white text-gray-900"
              >
                <option value="all">All Categories</option>
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-accent-blue transition-colors focus:outline-none bg-white text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-accent-blue transition-colors focus:outline-none bg-white text-gray-900"
              >
                <option value="due_date">Sort by Due Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* No Results */}
        <div className="bg-white rounded-lg shadow-card p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No bills found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search term
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setFilterCategory('all');
              setFilterStatus('all');
              setSearchTerm('');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and Actions Bar */}
      <div className="bg-white rounded-lg shadow-card p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Bills</h2>
            <p className="text-sm text-gray-600">
              Showing {sortedBills.length} of {bills.length} bills
            </p>
          </div>
          <Button onClick={onAddNew}>Add New Bill</Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-accent-blue transition-colors focus:outline-none bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-accent-blue transition-colors focus:outline-none bg-white text-gray-900"
            >
              <option value="all">All Categories</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-accent-blue transition-colors focus:outline-none bg-white text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-accent-blue transition-colors focus:outline-none bg-white text-gray-900"
            >
              <option value="due_date">Sort by Due Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {sortedBills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkAsPaid={onMarkAsPaid}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

BillsList.propTypes = {
  bills: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      currency: PropTypes.string.isRequired,
      due_date: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      paid: PropTypes.bool.isRequired,
    })
  ),
  isLoading: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMarkAsPaid: PropTypes.func.isRequired,
  onAddNew: PropTypes.func.isRequired,
};

export default BillsList;
