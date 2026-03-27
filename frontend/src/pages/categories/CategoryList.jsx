import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import inventoryAPI from '../../services/inventoryAPI';

/**
 * CategoryList Page - Main category view with CRUD operations
 * Modern UI with search, filters, pagination, and role-based actions
 */
function CategoryList() {
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  
  // State management
  const [categories, setCategories] = useState([]);
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
  const [deleteModal, setDeleteModal] = useState({ show: false, categoryId: null, categoryName: '' });

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[CategoryList] Fetching categories with filters:', filters);
      
      const response = await inventoryAPI.getAllCategories();
      
      if (response.success) {
        console.log('[CategoryList] Categories fetched:', response.data.length);
        setCategories(response.data);
        console.log(response.data);
        setPagination(prev => ({
          ...prev,
          totalItems: response.data.length,
          totalPages: Math.ceil(response.data.length / 10)
        }));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errorCode || 'Failed to fetch categories';
      setError(errorMessage);
      console.error('[CategoryList] Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters]);

  // Initial load and filter changes
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.currentPage !== 1) {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      } else {
        fetchCategories();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle delete click
  const handleDeleteClick = (category) => {
    setDeleteModal({
      show: true,
      categoryId: category.id,
      categoryName: category.name
    });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      console.log('[CategoryList] Deleting category ID:', deleteModal.categoryId);
      await inventoryAPI.deleteCategory(deleteModal.categoryId);
      console.log('[CategoryList] Category deleted successfully');
      setDeleteModal({ show: false, categoryId: null, categoryName: '' });
      fetchCategories();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errorCode || 'Failed to delete category';
      console.error('[CategoryList] Delete error:', err);
      alert(errorMessage);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Filtered categories based on search
  const filteredCategories = categories.filter(category => {
    const matchesSearch = !filters.search || 
      category.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      category.description?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.isActive || 
      (filters.isActive === 'active' && category.is_active !== 0) ||
      (filters.isActive === 'inactive' && category.is_active === 0);
    return matchesSearch && matchesStatus;
  });

  // Paginated categories
  const paginatedCategories = filteredCategories.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-4 text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          </div>
          {(isAdmin() || isManager()) && (
            <Link
              to="/categories/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              + Add Category
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search categories..."
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="sm:w-48">
              <select
                name="isActive"
                value={filters.isActive}
                onChange={handleFilterChange}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Loading categories...</div>
          </div>
        )}

        {/* Categories Table */}
        {!loading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{category.description || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          category.is_active !== 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.is_active !== 0 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.item_count || 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/categories/${category.id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          View
                        </Link>
                        {(isAdmin() || isManager()) && (
                          <>
                            <Link
                              to={`/categories/${category.id}/edit`}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(category)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {filteredCategories.length > pagination.itemsPerPage && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, filteredCategories.length)} of {filteredCategories.length} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete category "{deleteModal.categoryName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, categoryId: null, categoryName: '' })}
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

export default CategoryList;
