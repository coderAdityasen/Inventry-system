import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import inventoryAPI from '../../services/inventoryAPI';

/**
 * CategoryDetails Page - View category details
 * Modern UI with item list and role-based actions
 */
function CategoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isManager } = useAuth();
  
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch category and items
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('[CategoryDetails] Fetching category ID:', id);
        
        // Fetch category
        const categoryRes = await inventoryAPI.getCategoryById(id);
        
        if (categoryRes.success) {
          setCategory(categoryRes.data);
          console.log('[CategoryDetails] Category loaded:', categoryRes.data);
          
          // Fetch items in this category
          const itemsRes = await inventoryAPI.getAll({ category: id });
          if (itemsRes.success) {
            console.log(itemsRes.data.items)
            setItems(itemsRes.data.items);
            console.log('[CategoryDetails] Items loaded:', itemsRes.data.length);
          }
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch category';
        setError(errorMessage);
        console.error('[CategoryDetails] Error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    try {
      console.log('[CategoryDetails] Deleting category ID:', id);
      await inventoryAPI.deleteCategory(id);
      console.log('[CategoryDetails] Category deleted successfully');
      navigate('/categories');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errorCode || 'Failed to delete category';
      console.error('[CategoryDetails] Delete error:', err);
      alert(errorMessage);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading category...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link to="/categories" className="text-indigo-600 hover:text-indigo-700">
              ← Back to Categories
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </main>
      </div>
    );
  }

  // Not found state
  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link to="/categories" className="text-indigo-600 hover:text-indigo-700">
              ← Back to Categories
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-900">Category not found</h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/categories" className="mr-4 text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          </div>
          <div className="flex gap-3">
            {(isAdmin() || isManager()) && (
              <>
                <Link
                  to={`/categories/${id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Details */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Category Details</h2>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{category.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    category.is_active !== 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.is_active !== 0 ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{category.description || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {category.created_at ? new Date(category.created_at).toLocaleDateString() : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Items</dt>
                <dd className="mt-1 text-sm text-gray-900">{items.length}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Items in this Category */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Items in this Category</h2>
          </div>
          {items.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No items found in this category
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/inventory/${item.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default CategoryDetails;
