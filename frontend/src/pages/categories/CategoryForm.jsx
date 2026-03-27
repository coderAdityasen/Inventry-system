import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import inventoryAPI from '../../services/inventoryAPI';

/**
 * CategoryForm Page - Add/Edit category
 * Modern UI with validation and role-based access
 */
function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin, isManager } = useAuth();
  
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: 1
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  // Fetch category if edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchCategory = async () => {
        setFetching(true);
        try {
          console.log('[CategoryForm] Fetching category ID:', id);
          const response = await inventoryAPI.getCategoryById(id);
          
          if (response.success) {
            const category = response.data;
            setFormData({
              name: category.name || '',
              description: category.description || '',
              is_active: category.is_active !== 0 ? 1 : 0
            });
            console.log('[CategoryForm] Category loaded:', category);
          }
        } catch (err) {
          const errorMessage = err.response?.data?.message || 'Failed to fetch category';
          setError(errorMessage);
          console.error('[CategoryForm] Error:', err);
        } finally {
          setFetching(false);
        }
      };
      
      fetchCategory();
    }
  }, [id, isEditMode]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        is_active: formData.is_active
      };
      
      console.log('[CategoryForm] Submitting:', isEditMode ? 'Update' : 'Create', data);
      
      if (isEditMode) {
        await inventoryAPI.updateCategory(id, data);
        console.log('[CategoryForm] Category updated successfully');
      } else {
        await inventoryAPI.createCategory(data);
        console.log('[CategoryForm] Category created successfully');
      }
      
      navigate('/categories');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errorCode || 'Failed to save category';
      setError(errorMessage);
      console.error('[CategoryForm] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check permissions
  if (!isAdmin() && !isManager()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don't have permission to manage categories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Category' : 'Add Category'}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading */}
        {fetching && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Loading category...</div>
          </div>
        )}

        {/* Form */}
        {!fetching && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            {/* Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter category name"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter description (optional)"
              />
            </div>

            {/* Active Status */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active === 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked ? 1 : 0 }))}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/categories')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (isEditMode ? 'Update Category' : 'Create Category')}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default CategoryForm;
