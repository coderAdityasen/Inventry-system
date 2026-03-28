import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import inventoryAPI from '../../services/inventoryAPI';

/**
 * CategoryForm Page - Add/Edit category with detailed fields
 * Modern UI for real inventory management system
 */
function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin, isManager } = useAuth();
  
  const isEditMode = Boolean(id);
  
  // Form state with detailed fields for inventory management
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: 1,
    parent_id: '',
    display_order: 0,
    meta_title: '',
    meta_description: ''
  });
  
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  // Fetch parent categories for hierarchy selection
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await inventoryAPI.getAllCategories();
        if (response.success) {
          // Filter out current category if editing to prevent self-reference
          const filtered = response.data.filter(c => c.id !== parseInt(id));
          setParentCategories(filtered);
        }
      } catch (err) {
        console.error('[CategoryForm] Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, [id]);

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
              is_active: category.is_active !== 0 ? 1 : 0,
              parent_id: category.parent_id || '',
              display_order: category.display_order || 0,
              meta_title: category.meta_title || '',
              meta_description: category.meta_description || ''
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
        is_active: formData.is_active,
        parent_id: formData.parent_id || null,
        display_order: parseInt(formData.display_order) || 0,
        meta_title: formData.meta_title.trim(),
        meta_description: formData.meta_description.trim()
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
          <div className="flex items-center">
            <button
              onClick={() => navigate('/categories')}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Category' : 'Add New Category'}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Category Name */}
                <div>
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
                    placeholder="e.g., Electronics, Clothing, Home & Garden"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The name that will be displayed in the category list
                  </p>
                </div>

                {/* Description */}
                <div>
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
                    placeholder="Provide a detailed description of this category..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Detailed description helps users understand the category scope
                  </p>
                </div>
              </div>
            </div>

            {/* Category Hierarchy */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Category Hierarchy</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parent Category */}
                <div>
                  <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category
                  </label>
                  <select
                    id="parent_id"
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleChange}
                    className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">None (Top Level Category)</option>
                    {parentCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Select a parent category to create sub-categories
                  </p>
                </div>

                {/* Display Order */}
                <div>
                  <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    id="display_order"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleChange}
                    min="0"
                    className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Order in which categories are displayed (lower numbers first)
                  </p>
                </div>
              </div>
            </div>

            {/* Status & SEO */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Status & SEO Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Status
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_active"
                        value={1}
                        checked={formData.is_active === 1}
                        onChange={() => setFormData(prev => ({ ...prev, is_active: 1 }))}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                      <span className="ml-2 text-xs text-gray-500">(Visible in system)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_active"
                        value={0}
                        checked={formData.is_active === 0}
                        onChange={() => setFormData(prev => ({ ...prev, is_active: 0 }))}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Inactive</span>
                      <span className="ml-2 text-xs text-gray-500">(Hidden from system)</span>
                    </label>
                  </div>
                </div>

                {/* Meta Title */}
                <div>
                  <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    id="meta_title"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleChange}
                    className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="SEO title for search engines"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended: 50-60 characters
                  </p>
                </div>

                {/* Meta Description */}
                <div className="md:col-span-2">
                  <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleChange}
                    rows={2}
                    className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="SEO description for search engines..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended: 150-160 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/categories')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
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
