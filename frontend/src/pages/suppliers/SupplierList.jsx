import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import supplierAPI from '../../services/supplierAPI';

/**
 * SupplierList Page - Main supplier view with CRUD operations
 * Modern UI with stats, search, filters, and role-based actions
 */
function SupplierList() {
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  
  // State management
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalPurchaseValue: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
    sortBy: 'name' // name, recently_added
  });

  // Modal state for delete confirmation
  const [deleteModal, setDeleteModal] = useState({ 
    show: false, 
    supplierId: null, 
    supplierName: '',
    hasItems: false,
    hasOrders: false
  });

  // Status update modal
  const [statusModal, setStatusModal] = useState({
    show: false,
    supplier: null,
    newStatus: null
  });

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      console.log('[SupplierList] Fetching supplier stats');
      const response = await supplierAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('[SupplierList] Error fetching stats:', err);
    }
  }, []);

  // Fetch suppliers
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[SupplierList] Fetching suppliers with filters:', filters);
      
      const response = await supplierAPI.getAll({
        page: pagination.currentPage,
        limit: 10,
        search: filters.search,
        isActive: filters.isActive || null
      });
      
      if (response.success) {
        console.log('[SupplierList] Suppliers fetched:', response.data.length);
        setSuppliers(response.data);
        // Update pagination if backend returns total count
        if (response.data.length > 0) {
          setPagination(prev => ({
            ...prev,
            totalItems: response.data.length,
            totalPages: Math.ceil(response.data.length / 10)
          }));
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errorCode || 'Failed to fetch suppliers';
      setError(errorMessage);
      console.error('[SupplierList] Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Load suppliers when page or filters change
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.currentPage !== 1) {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      } else {
        fetchSuppliers();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Handle delete click
  const handleDeleteClick = (supplier) => {
    // Check if supplier has linked items or orders before showing delete confirmation
    const hasItems = supplier.itemCount > 0;
    const hasOrders = supplier.orderCount > 0;
    setDeleteModal({ 
      show: true, 
      supplierId: supplier.id, 
      supplierName: supplier.name,
      hasItems,
      hasOrders
    });
  };

  // Handle status toggle click
  const handleStatusToggleClick = (supplier) => {
    setStatusModal({
      show: true,
      supplier: supplier,
      newStatus: !supplier.is_active
    });
  };

  // Confirm status change
  const confirmStatusChange = async () => {
    try {
      console.log('[SupplierList] Confirming status change for supplier:', statusModal.supplier.id);
      const response = await supplierAPI.toggleStatus(statusModal.supplier.id);
      
      if (response.success) {
        console.log('[SupplierList] Status toggled successfully');
        setStatusModal({ show: false, supplier: null, newStatus: null });
        fetchSuppliers();
        fetchStats();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to toggle supplier status';
      setError(errorMessage);
      console.error('[SupplierList] Error toggling status:', err);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      console.log('[SupplierList] Confirming delete for supplier ID:', deleteModal.supplierId);
      const response = await supplierAPI.delete(deleteModal.supplierId);
      
      if (response.success) {
        console.log('[SupplierList] Supplier deleted successfully');
        setDeleteModal({ show: false, supplierId: null, supplierName: '', hasItems: false, hasOrders: false });
        fetchSuppliers();
        fetchStats();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete supplier';
      setError(errorMessage);
      console.error('[SupplierList] Error deleting supplier:', err);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Render loading state
  if (loading && suppliers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="mr-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
            </div>
            {(isAdmin() || isManager()) && (
              <Link
                to="/suppliers/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Supplier
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Suppliers */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Suppliers */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Suppliers</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Inactive Suppliers */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Inactive Suppliers</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.inactive}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Purchase Value */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Purchase Value</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{formatCurrency(stats.totalPurchaseValue)}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-4 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by supplier name, email, phone..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="text-black w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              />
            </div>

            {/* Filter by status */}
            <div className="w-full md:w-40">
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
                className="text-black w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Sort */}
            <div className="w-full md:w-44">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="text-black w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
              >
                <option value="name">Sort by Name</option>
                <option value="recently_added">Recently Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Suppliers List - Card Layout */}
        <div className="space-y-4">
          {suppliers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No suppliers found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {isManager() ? 'Click "Add Supplier" to create your first supplier.' : 'No suppliers match your search criteria.'}
              </p>
            </div>
          ) : (
            suppliers.map((supplier) => (
              <div 
                key={supplier.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/suppliers/${supplier.id}`)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    {/* Left side - Supplier Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                          {supplier.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                          <p className="text-sm text-gray-500">{supplier.contact_person || 'No contact person'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {/* Contact Details */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Contact Details</p>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {supplier.phone || '—'}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {supplier.email || '—'}
                            </p>
                            {supplier.address && (
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate max-w-[200px]">{supplier.address}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Linked Products */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Linked Products</p>
                          <button 
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/inventory?supplier=${supplier.id}`);
                            }}
                          >
                            {supplier.itemCount || 0} Products
                          </button>
                        </div>

                        {/* Purchase Stats */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Purchase Stats</p>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              Total orders: <span className="font-medium">{supplier.orderCount || 0}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Total amount: <span className="font-medium text-indigo-600">{formatCurrency(supplier.totalOrdersAmount || 0)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Status and Actions */}
                    <div className="flex flex-col items-end gap-3 ml-4">
                      {/* Status Badge */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusToggleClick(supplier);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          supplier.is_active 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {supplier.is_active ? 'Active' : 'Inactive'}
                      </button>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {(isAdmin() || isManager()) && (
                          <>
                            <Link
                              to={`/suppliers/${supplier.id}/edit`}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                            {isAdmin() && (
                              <button
                                onClick={() => handleDeleteClick(supplier)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  pagination.currentPage > 1
                    ? 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  pagination.currentPage < pagination.totalPages
                    ? 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-auto transform transition-all">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Confirm Delete</h3>
            <p className="text-gray-600 text-center mb-4">
              Are you sure you want to delete <strong className="text-gray-900">{deleteModal.supplierName}</strong>?
            </p>
            
            {/* Warnings */}
            {(deleteModal.hasItems || deleteModal.hasOrders) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium mb-1">⚠️ Warning:</p>
                <ul className="text-sm text-amber-700 list-disc list-inside">
                  {deleteModal.hasItems && <li>This supplier has linked products that will be affected</li>}
                  {deleteModal.hasOrders && <li>This supplier has associated orders</li>}
                </ul>
              </div>
            )}
            
            <p className="text-sm text-gray-500 text-center mb-6">
              This action cannot be undone. All supplier data will be permanently removed.
            </p>
            
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setDeleteModal({ show: false, supplierId: null, supplierName: '', hasItems: false, hasOrders: false })}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {statusModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-auto transform transition-all">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              {statusModal.newStatus ? 'Activate Supplier' : 'Deactivate Supplier'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to {statusModal.newStatus ? 'activate' : 'deactivate'} <strong className="text-gray-900">{statusModal.supplier?.name}</strong>?
              {statusModal.newStatus ? ' They will be able to receive new orders.' : ' They will not appear in active supplier lists.'}
            </p>
            
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setStatusModal({ show: false, supplier: null, newStatus: null })}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                  statusModal.newStatus 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {statusModal.newStatus ? 'Activate' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupplierList;
