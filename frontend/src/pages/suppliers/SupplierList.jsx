import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import supplierAPI from '../../services/supplierAPI';

/**
 * SupplierList Page - Main supplier view with CRUD operations
 * Modern UI with search, filters, pagination, and role-based actions
 */
function SupplierList() {
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  
  // State management
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    isActive: ''
  });

  // Modal state for delete confirmation
  const [deleteModal, setDeleteModal] = useState({ show: false, supplierId: null, supplierName: '' });

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

  // Initial load and filter changes
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
    setDeleteModal({ show: true, supplierId: supplier.id, supplierName: supplier.name });
  };

  // Handle status toggle
  const handleStatusToggle = async (supplier) => {
    try {
      console.log('[SupplierList] Toggling status for supplier:', supplier.id);
      const response = await supplierAPI.toggleStatus(supplier.id);
      
      if (response.success) {
        console.log('[SupplierList] Status toggled successfully');
        fetchSuppliers();
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
        setDeleteModal({ show: false, supplierId: null, supplierName: '' });
        fetchSuppliers();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete supplier';
      setError(errorMessage);
      console.error('[SupplierList] Error deleting supplier:', err);
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="sr-only">Dismiss</span>
              ×
            </button>
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by name, email, or contact..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter by status */}
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="text-black px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {/* Add Button - Admin/Manager only */}
            {(isAdmin() || isManager()) && (
              <Link
                to="/suppliers/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                + Add Supplier
              </Link>
            )}
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No suppliers found. {isManager() && 'Click "Add Supplier" to create one.'}
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{supplier.contact_person || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{supplier.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{supplier.phone || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          supplier.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {supplier.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/suppliers/${supplier.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </Link>
                        {(isAdmin() || isManager()) && (
                          <>
                            <Link
                              to={`/suppliers/${supplier.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleStatusToggle(supplier)}
                              className="text-yellow-600 hover:text-yellow-900 mr-4"
                            >
                              {supplier.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            {isAdmin() && (
                              <button
                                onClick={() => handleDeleteClick(supplier)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-3 py-1 border rounded-md ${
                    pagination.currentPage > 1
                      ? 'bg-white text-gray-700 hover:bg-gray-50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-3 py-1 border rounded-md ${
                    pagination.currentPage < pagination.totalPages
                      ? 'bg-white text-gray-700 hover:bg-gray-50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteModal.supplierName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ show: false, supplierId: null, supplierName: '' })}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupplierList;
