import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import inventoryAPI from '../../services/inventoryAPI';
import axios from 'axios';


/**
 * InventoryForm Page - Add/Edit inventory item
 * With category and supplier options loaded from API
 */
function InventoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    quantity: 0,
    price: 0,
    category_id: '',
    supplier_id: '',
    low_stock_threshold: 10,
    image_url: ''
  });

  // State management
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  // Category and supplier options
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Fetch categories and suppliers on mount
  useEffect(() => {
    const fetchOptions = async () => {
      console.log('[InventoryForm] Fetching category and supplier options');
      try {
        const [categoriesRes, suppliersRes] = await Promise.all([
          inventoryAPI.getAllCategories(),
          inventoryAPI.getAllSuppliers()
        ]);
        
        if (categoriesRes.success) {
          setCategories(categoriesRes.data);
          console.log('[InventoryForm] Categories loaded:', categoriesRes.data.length);
        }
        
        if (suppliersRes.success) {
          setSuppliers(suppliersRes.data);
          console.log('[InventoryForm] Suppliers loaded:', suppliersRes.data.length);
        }
      } catch (err) {
        console.error('[InventoryForm] Error fetching options:', err);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // Fetch item data if editing
  useEffect(() => {
    if (isEditMode) {
      const fetchItem = async () => {
        console.log('[InventoryForm] Fetching item for edit, ID:', id);
        try {
          const response = await inventoryAPI.getById(id);
          if (response.success) {
            const item = response.data;
            console.log('[InventoryForm] Item loaded:', item.name);
            setFormData({
              name: item.name || '',
              sku: item.sku || '',
              description: item.description || '',
              quantity: item.quantity || 0,
              price: item.price || 0,
              category_id: item.category_id || '',
              supplier_id: item.supplier_id || '',
              low_stock_threshold: item.low_stock_threshold || 10,
              image_url: item.image_url || ''
            });
          }
        } catch (err) {
          console.error('[InventoryForm] Error fetching item:', err);
          const errorMessage = err.response?.data?.message || 'Failed to fetch item';
          setError(errorMessage);
        } finally {
          setFetching(false);
        }
      };
      fetchItem();
    }
  }, [id, isEditMode]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }

    if (!formData.image_url) {
      newErrors.image_url = 'Product image is required';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (formData.low_stock_threshold < 0) {
      newErrors.low_stock_threshold = 'Threshold must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      console.log('[InventoryForm] Uploading image to Cloudinary:', file.name);
      
      const imageFormdata = new FormData();
      imageFormdata.append('file', file);
      imageFormdata.append('upload_preset', 'adityasenhulala');

      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dj3gpszjr/image/upload', 
        imageFormdata
      );

      console.log('[InventoryForm] Cloudinary response:', response.data);
      
      if (response.data.secure_url) {
        setFormData(prev => ({
          ...prev,
          image_url: response.data.secure_url
        }));
        console.log('[InventoryForm] Image uploaded successfully to Cloudinary');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to upload image to Cloudinary';
      setError(errorMessage);
      console.error('[InventoryForm] Cloudinary upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      
      console.log('[InventoryForm] Submitting form, isEditMode:', isEditMode, 'Data:', formData);
      
      if (isEditMode) {
        response = await inventoryAPI.update(id, formData);
      } else {
        response = await inventoryAPI.create(formData);
      }

      console.log('[InventoryForm] Submit response:', response);

      if (response.success) {
        console.log('[InventoryForm] Item saved successfully, navigating to inventory list');
        navigate('/inventory');
      }
    } catch (err) {
      const errorData = err.response?.data;
      console.error('[InventoryForm] Submit error:', err);
      
      if (errorData?.errors) {
        // Handle validation errors
        const fieldErrors = {};
        errorData.errors.forEach(err => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
        setError('Please fix the validation errors');
      } else {
        setError(errorData?.message || `Failed to ${isEditMode ? 'update' : 'create'} item`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state for fetching
  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading item...</p>
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
              to="/inventory"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Inventory
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Item' : 'Add New Item'}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={` text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter item name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* SKU */}
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className={`text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.sku ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., SKU-001"
              />
              {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter item description"
              />
            </div>

            {/* Quantity and Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={`text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.quantity ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className={`text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>
            </div>

            {/* Category and Supplier Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  disabled={loadingOptions}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {loadingOptions ? 'Loading...' : 'Select Category'}
                  </option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <select
                  id="supplier_id"
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleChange}
                  disabled={loadingOptions}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {loadingOptions ? 'Loading...' : 'Select Supplier'}
                  </option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Low Stock Threshold */}
            <div>
              <label htmlFor="low_stock_threshold" className="block text-sm font-medium text-gray-700 mb-1">
                Low Stock Threshold
              </label>
              <input
                type="number"
                id="low_stock_threshold"
                name="low_stock_threshold"
                min="0"
                value={formData.low_stock_threshold}
                onChange={handleChange}
                className={`text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.low_stock_threshold ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.low_stock_threshold && (
                <p className="mt-1 text-sm text-red-600">{errors.low_stock_threshold}</p>
              )}
              <p className=" mt-1 text-xs text-gray-500">
                Alert will be triggered when quantity falls below this threshold
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50">
                <div className="space-y-1 text-center">
                  {formData.image_url ? (
                    <div className="relative">
                      <img
                        src={formData.image_url}
                        alt="Product"
                        className="mx-auto h-48 w-48 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageUpload}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
              {uploading && (
                <div className="mt-2 flex items-center text-sm text-blue-600">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <Link
              to="/inventory"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Item' : 'Create Item'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default InventoryForm;