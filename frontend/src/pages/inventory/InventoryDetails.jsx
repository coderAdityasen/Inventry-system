import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import inventoryAPI from '../../services/inventoryAPI';

/**
 * InventoryDetails Page - View single item details
 */
function InventoryDetails() {
  const { id } = useParams();
  
  // State management
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch item data
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await inventoryAPI.getById(id);
        
        if (response.success) {
          setItem(response.data);
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch item';
        setError(errorMessage);
        console.error('Error fetching item:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItem();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <Link to="/inventory" className="text-red-700 underline mt-2 inline-block">
              Back to Inventory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No item found
  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">Item not found</p>
            <Link to="/inventory" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
              Back to Inventory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Stock status calculation
  const getStockStatus = () => {
    if (item.quantity === 0) {
      return { status: 'out_of_stock', label: 'Out of Stock', class: 'bg-red-100 text-red-800' };
    }
    if (item.quantity <= item.low_stock_threshold) {
      return { status: 'low_stock', label: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' };
    }
    return { status: 'in_stock', label: 'In Stock', class: 'bg-green-100 text-green-800' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Item Details</h1>
          <Link
            to="/inventory"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Inventory
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Item Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Image */}
          {item.image_url && (
            <div className="h-64 w-full bg-gray-100">
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Header with Name and SKU */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
                <p className="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.class}`}>
                {stockStatus.label}
              </span>
            </div>

            {/* Description */}
            {item.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-gray-700">{item.description}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Quantity
                </h3>
                <p className="text-3xl font-bold text-gray-900">{item.quantity}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Low stock threshold: {item.low_stock_threshold}
                </p>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Price
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  ${parseFloat(item.price || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total value: ${(item.quantity * item.price).toFixed(2)}
                </p>
              </div>

              {/* Category */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Category
                </h3>
                <p className="text-gray-900">
                  {item.category_name || '—'}
                </p>
              </div>

              {/* Supplier */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Supplier
                </h3>
                <p className="text-gray-900">
                  {item.supplier_name || '—'}
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(item.created_at).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>{' '}
                  {new Date(item.updated_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default InventoryDetails;