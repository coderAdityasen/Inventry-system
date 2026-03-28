import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import supplierAPI from '../../services/supplierAPI';

/**
 * SupplierDetails Page - View supplier details with multiple sections
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
  const [activeTab, setActiveTab] = useState('profile');

  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState({ show: false });
  const [statusModal, setStatusModal] = useState({ show: false, newStatus: null });

  // Fetch supplier data
  useEffect(() => {
    const fetchSupplier = async () => {
      console.log('[SupplierDetails] Fetching supplier details for ID:', id);
      try {
        const response = await supplierAPI.getWithPurchaseStats(id);
        
        if (response.success) {
          const supplierData = response.data;
          console.log('[SupplierDetails] Supplier loaded:', supplierData.name);
          setSupplier(supplierData);
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
        const updatedResponse = await supplierAPI.getWithPurchaseStats(id);
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

  // Handle delete click
  const handleDeleteClick = () => {
    setDeleteModal({ show: true });
  };

  // Confirm delete
  const confirmDelete = async () => {
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 text-lg font-medium">{error}</p>
          <Link to="/suppliers" className="text-blue-600 hover:text-blue-500 mt-4 inline-block">
            Back to Suppliers
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Supplier Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'business', label: 'Business Summary', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'products', label: 'Product Details', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'orders', label: 'Purchase History', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/suppliers"
                className="mr-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Supplier Details</h1>
            </div>
            <div className="flex items-center space-x-3">
              {(isAdmin() || isManager()) && (
                <Link
                  to={`/suppliers/${id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
              )}
              {isAdmin() && (
                <button
                  onClick={handleDeleteClick}
                  className="inline-flex items-center px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Supplier Header Card */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-6 border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                {supplier.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{supplier.name}</h2>
                <p className="text-gray-500">{supplier.contact_person || 'No contact person'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    supplier.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {supplier.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {(isAdmin() || isManager()) && (
                    <button
                      onClick={() => setStatusModal({ show: true, newStatus: !supplier.is_active })}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {supplier.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-6 border border-gray-100 overflow-hidden">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Supplier Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Company Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Company Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Supplier Name</span>
                      <span className="font-medium text-gray-900">{supplier.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Contact Person</span>
                      <span className="font-medium text-gray-900">{supplier.contact_person || '—'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Status</span>
                      <span className={`font-medium ${supplier.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                        {supplier.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Email</span>
                      <a href={`mailto:${supplier.email}`} className="font-medium text-blue-600 hover:text-blue-800">
                        {supplier.email || '—'}
                      </a>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Phone</span>
                      <a href={`tel:${supplier.phone}`} className="font-medium text-blue-600 hover:text-blue-800">
                        {supplier.phone || '—'}
                      </a>
                    </div>
                    <div className="py-2 border-b border-gray-100">
                      <span className="text-gray-500 block mb-1">Address</span>
                      <span className="font-medium text-gray-900 whitespace-pre-wrap">{supplier.address || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="py-2 border-b border-gray-100">
                      <span className="text-gray-500 block mb-1">Notes</span>
                      <span className="font-medium text-gray-900 whitespace-pre-wrap">{supplier.notes || '—'}</span>
                    </div>
                    <div className="py-2 border-b border-gray-100">
                      <span className="text-gray-500 block mb-1">Created At</span>
                      <span className="font-medium text-gray-900">{formatDate(supplier.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Summary Tab */}
          {activeTab === 'business' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Orders */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Orders</p>
                      <p className="text-3xl font-bold text-blue-900 mt-1">{supplier.orderStats?.totalOrders || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-200 rounded-lg">
                      <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-600">Total Purchase Amount</p>
                      <p className="text-3xl font-bold text-indigo-900 mt-1">{formatCurrency(supplier.orderStats?.totalAmount)}</p>
                    </div>
                    <div className="p-3 bg-indigo-200 rounded-lg">
                      <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Linked Products */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Linked Products</p>
                      <p className="text-3xl font-bold text-green-900 mt-1">{supplier.itemCount || 0}</p>
                    </div>
                    <div className="p-3 bg-green-200 rounded-lg">
                      <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status Breakdown */}
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Order Status Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-100">
                  <p className="text-2xl font-bold text-yellow-700">{supplier.orderStats?.pendingOrders || 0}</p>
                  <p className="text-sm text-yellow-600">Pending</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
                  <p className="text-2xl font-bold text-blue-700">{supplier.orderStats?.processingOrders || 0}</p>
                  <p className="text-sm text-blue-600">Processing</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
                  <p className="text-2xl font-bold text-green-700">{supplier.orderStats?.completedOrders || 0}</p>
                  <p className="text-sm text-green-600">Completed</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center border border-red-100">
                  <p className="text-2xl font-bold text-red-700">{supplier.orderStats?.cancelledOrders || 0}</p>
                  <p className="text-sm text-red-600">Cancelled</p>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                <Link
                  to={`/inventory?supplier=${id}`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Products →
                </Link>
              </div>
              {supplier.itemCount > 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">This supplier has {supplier.itemCount} linked products.</p>
                  <Link
                    to={`/inventory?supplier=${id}`}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View Products
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <h4 className="mt-4 text-lg font-medium text-gray-900">No Products Linked</h4>
                  <p className="mt-2 text-sm text-gray-500">This supplier doesn't have any linked products yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Purchase History</h3>
                <Link
                  to="/orders"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Orders →
                </Link>
              </div>
              {supplier.orderStats?.totalOrders > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-500 border-b border-gray-200 pb-2">
                    <div>Metric</div>
                    <div>Value</div>
                    <div>Percentage</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 items-center">
                    <div className="text-gray-900">Total Orders</div>
                    <div className="font-semibold text-gray-900">{supplier.orderStats?.totalOrders || 0}</div>
                    <div className="text-gray-500">100%</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 items-center">
                    <div className="text-gray-900">Completed Orders</div>
                    <div className="font-semibold text-green-600">{supplier.orderStats?.completedOrders || 0}</div>
                    <div className="text-gray-500">
                      {supplier.orderStats?.totalOrders ? Math.round((supplier.orderStats.completedOrders / supplier.orderStats.totalOrders) * 100) : 0}%
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 items-center">
                    <div className="text-gray-900">Pending Orders</div>
                    <div className="font-semibold text-yellow-600">{supplier.orderStats?.pendingOrders || 0}</div>
                    <div className="text-gray-500">
                      {supplier.orderStats?.totalOrders ? Math.round((supplier.orderStats.pendingOrders / supplier.orderStats.totalOrders) * 100) : 0}%
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 items-center">
                    <div className="text-gray-900">Processing Orders</div>
                    <div className="font-semibold text-blue-600">{supplier.orderStats?.processingOrders || 0}</div>
                    <div className="text-gray-500">
                      {supplier.orderStats?.totalOrders ? Math.round((supplier.orderStats.processingOrders / supplier.orderStats.totalOrders) * 100) : 0}%
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-3 items-center">
                    <div className="text-gray-900">Cancelled Orders</div>
                    <div className="font-semibold text-red-600">{supplier.orderStats?.cancelledOrders || 0}</div>
                    <div className="text-gray-500">
                      {supplier.orderStats?.totalOrders ? Math.round((supplier.orderStats.cancelledOrders / supplier.orderStats.totalOrders) * 100) : 0}%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h4 className="mt-4 text-lg font-medium text-gray-900">No Purchase History</h4>
                  <p className="mt-2 text-sm text-gray-500">This supplier doesn't have any purchase orders yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Confirm Delete</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <strong className="text-gray-900">{supplier.name}</strong>?
              {(supplier.itemCount > 0 || supplier.orderStats?.totalOrders > 0) && (
                <span className="block mt-2 text-amber-600">
                  ⚠️ This supplier has {supplier.itemCount} linked products and {supplier.orderStats?.totalOrders || 0} orders.
                </span>
              )}
            </p>
            <p className="text-sm text-gray-500 text-center mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setDeleteModal({ show: false })}
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

      {/* Status Change Modal */}
      {statusModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              {statusModal.newStatus ? 'Activate' : 'Deactivate'} Supplier
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to {statusModal.newStatus ? 'activate' : 'deactivate'} <strong className="text-gray-900">{supplier.name}</strong>?
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setStatusModal({ show: false, newStatus: null })}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusToggle}
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

export default SupplierDetails;
