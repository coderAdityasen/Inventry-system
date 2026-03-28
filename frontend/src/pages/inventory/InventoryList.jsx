import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import inventoryAPI from '../../services/inventoryAPI';


/**
 * InventoryList Page - Main inventory view with CRUD operations
 */
function InventoryList() {
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  
  // State management
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  // Stats state - updated to match requirements
  const [stats, setStats] = useState({ 
    totalProducts: 0, 
    lowStockProducts: 0, 
    lowStockItems: 0,
    outOfStockProducts: 0 
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    supplier: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Modal state for delete confirmation
  const [deleteModal, setDeleteModal] = useState({ show: false, itemId: null, itemName: '' });

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[InventoryList] Fetching items with filters:', filters);
      
      const response = await inventoryAPI.getAll({
        page: pagination.currentPage,
        limit: 10,
        search: filters.search,
        category: filters.category || null,
        supplier: filters.supplier || null,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });
      
      if (response.success) {
        console.log('[InventoryList] Items fetched:', response.data.items.length);
        setItems(response.data.items);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errorCode || 'Failed to fetch items';
      setError(errorMessage);
      console.error('[InventoryList] Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters]);

  // Initial load and filter changes
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('[InventoryList] Fetching inventory stats');
        const response = await inventoryAPI.getStats();
        if (response.success) {
          setStats(response.data);
          console.log('[InventoryList] Stats fetched:', response.data);
        }
      } catch (err) {
        console.error('[InventoryList] Error fetching stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.currentPage !== 1) {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      } else {
        fetchItems();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Handle delete click
  const handleDeleteClick = (item) => {
    setDeleteModal({ show: true, itemId: item.id, itemName: item.name });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      console.log('[InventoryList] Confirming delete for item ID:', deleteModal.itemId);
      const response = await inventoryAPI.delete(deleteModal.itemId);
      
      if (response.success) {
        console.log('[InventoryList] Item deleted successfully');
        setDeleteModal({ show: false, itemId: null, itemName: '' });
        fetchItems();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete item';
      setError(errorMessage);
      console.error('[InventoryList] Error deleting item:', err);
    }
  };

  // Render loading state
  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        {!loadingStats && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Products */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-2.5">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                        <dd className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Low Stock */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-2.5">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Low Stock</dt>
                        <dd className="text-2xl font-semibold text-gray-900">{stats.lowStockProducts}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Out of Stock */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-500 rounded-md p-2.5">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Out of Stock</dt>
                        <dd className="text-2xl font-semibold text-gray-900">{stats.outOfStockProducts}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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

        {/* Stats Section */}
        {!loadingStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Products</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-amber-600">Low Stock Items</div>
              <div className="text-2xl font-bold text-amber-600">{stats.lowStockItems}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-red-600">Out of Stock</div>
              <div className="text-2xl font-bold text-red-600">{stats.outOfStockProducts}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-emerald-600">Low Stock Products</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.lowStockProducts}</div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search with two buttons */}
            <div className="flex-1 max-w-md">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="text-black flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => fetchItems()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                {filters.search && (
                  <button
                    onClick={() => {
                      handleFilterChange('search', '');
                      setPagination(prev => ({ ...prev, currentPage: 1 }));
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Add Button - Admin/Manager only */}
            {(isAdmin() || isManager()) && (
              <Link
                to="/inventory/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                + Add Item
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-4">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="text-black px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {/* Categories will be loaded from API */}
            </select>
            
            <select
              value={filters.supplier}
              onChange={(e) => handleFilterChange('supplier', e.target.value)}
              className="text-black px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Suppliers</option>
              {/* Suppliers will be loaded from API */}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="text-black px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="price">Sort by Price</option>
              <option value="created_at">Sort by Date</option>
            </select>
            
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="text-black px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name / SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No items found. {isManager() && 'Click "Add Item" to create one.'}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/inventory/${item.id}`)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                          <span className="text-xs text-gray-500">SKU: {item.sku}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {item.category_name || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          item.quantity <= item.low_stock_threshold 
                            ? item.quantity === 0 ? 'text-red-600' : 'text-yellow-600'
                            : 'text-gray-900'
                        }`}>
                          {item.quantity}
                          {item.quantity <= item.low_stock_threshold && (
                            <span className="ml-2 text-xs">
                              ({item.quantity === 0 ? 'Out of stock' : 'Low stock'})
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          ${parseFloat(item.price || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {item.supplier_name || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {(isAdmin() || isManager()) && (
                            <Link
                              to={`/inventory/${item.id}/edit`}
                              className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                          )}
                          {isAdmin() && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(item);
                              }}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
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
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className={`px-3 py-1 border rounded-md ${
                    pagination.hasPrev
                      ? 'bg-white text-gray-700 hover:bg-gray-50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className={`px-3 py-1 border rounded-md ${
                    pagination.hasNext
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
              Are you sure you want to delete <strong>{deleteModal.itemName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ show: false, itemId: null, itemName: '' })}
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

export default InventoryList;