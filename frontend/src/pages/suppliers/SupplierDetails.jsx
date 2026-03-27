import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import supplierAPI from '../../services/supplierAPI';

/**
 * SupplierDetails Page - View supplier details
 * Modern UI with role-based actions
 */
function SupplierDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAdmin, isManager } = useAuth();
  
  // State management
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemCount, setItemCount] = useState(0);

  // Fetch supplier data
  useEffect(() => {
    const fetchSupplier = async () => {
      console.log('[SupplierDetails] Fetching supplier details for ID:', id);
      try {
        const response = await supplierAPI.getWithItemCount(id);
        
        if (response.success) {
          const supplierData = response.data;
          console.log('[SupplierDetails] Supplier loaded:', supplierData.name);
          setSupplier(supplierData);
          setItemCount(supplierData.itemCount || 0);
        }
      } catch (err) {
        console.error('[SupplierDetails] Error fetching supplier:', err);
        const errorMessage = err.response?.data?.message || 'Failed to fetch supplier details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id]);

  // Handle status toggle
  const handleStatusToggle = async () => {
    try {
      console.log('[SupplierDetails] Toggling status for supplier:', id);
      const response = await supplierAPI.toggleStatus(id);
      
      if (response.success) {
        console.log('[SupplierDetails] Status toggled successfully');
        // Refresh supplier data
        const updatedResponse = await supplierAPI.getWithItemCount(id);
        if (updatedResponse.success) {
          setSupplier(updatedResponse.data);
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to toggle supplier status';
      setError(errorMessage);
      console.error('[SupplierDetails] Error toggling status:', err);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    try {
      console.log('[SupplierDetails] Deleting supplier:', id);
      const response = await supplierAPI.delete(id);
      
      if (response.success) {
        console.log('[SupplierDetails] Supplier deleted successfully');
        navigate('/suppliers');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete supplier';
      setError(errorMessage);
      console.error('[SupplierDetails] Error deleting supplier:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Link to="/suppliers" className="text-blue-600 hover:text-blue-500 mt-4 inline-block">
            Back to Suppliers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Supplier Details</h1>
          <Link
            to="/suppliers"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Suppliers
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Supplier Details Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header with status */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{supplier.name}</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                supplier.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {supplier.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex space-x-3">
              {(isAdmin() || isManager()) && (
                <>
                  <Link
                    to={`/suppliers/${id}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleStatusToggle}
                    className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 hover:bg-yellow-50"
                  >
                    {supplier.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </>
              )}
              {isAdmin() && (
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              {/* Contact Person */}
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                <dd className="mt-1 text-sm text-gray-900">{supplier.contact_person || '—'}</dd>
              </div>

              {/* Email */}
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a href={`mailto:${supplier.email}`} className="text-blue-600 hover:text-blue-500">
                    {supplier.email}
                  </a>
                </dd>
              </div>

              {/* Phone */}
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a href={`tel:${supplier.phone}`} className="text-blue-600 hover:text-blue-500">
                    {supplier.phone || '—'}
                  </a>
                </dd>
              </div>

              {/* Linked Items */}
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Linked Items</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {itemCount > 0 ? (
                    <Link to={`/inventory?supplier=${id}`} className="text-blue-600 hover:text-blue-500">
                      {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </Link>
                  ) : (
                    <span>{itemCount} items</span>
                  )}
                </dd>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {supplier.address || '—'}
                </dd>
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {supplier.notes || '—'}
                </dd>
              </div>

              {/* Created At */}
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {supplier.created_at ? new Date(supplier.created_at).toLocaleString() : '—'}
                </dd>
              </div>

              {/* Updated At */}
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {supplier.updated_at ? new Date(supplier.updated_at).toLocaleString() : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-start">
          <Link
            to="/suppliers"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Suppliers List
          </Link>
        </div>
      </main>
    </div>
  );
}

export default SupplierDetails;
