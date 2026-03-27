import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import orderAPI from '../../services/orderAPI';

/**
 * OrderDetails Page - View order details
 * Modern UI with order items and role-based actions
 */
function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isManager } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state for status update
  const [statusModal, setStatusModal] = useState({ show: false, newStatus: '' });

  // Fetch order
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        console.log('[OrderDetails] Fetching order ID:', id);
        
        const response = await orderAPI.getById(id);
        
        if (response.success) {
          setOrder(response.data);
          console.log('[OrderDetails] Order loaded:', response.data.order_number);
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch order';
        setError(errorMessage);
        console.error('[OrderDetails] Error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);

  // Handle status update
  const handleStatusUpdate = async () => {
    try {
      console.log('[OrderDetails] Updating status to:', statusModal.newStatus);
      await orderAPI.updateStatus(id, statusModal.newStatus);
      console.log('[OrderDetails] Status updated successfully');
      setStatusModal({ show: false, newStatus: '' });
      
      // Refresh order
      const response = await orderAPI.getById(id);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errorCode || 'Failed to update status';
      console.error('[OrderDetails] Status update error:', err);
      alert(errorMessage);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }
    
    try {
      console.log('[OrderDetails] Deleting order ID:', id);
      await orderAPI.delete(id);
      console.log('[OrderDetails] Order deleted successfully');
      navigate('/orders');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errorCode || 'Failed to delete order';
      console.error('[OrderDetails] Delete error:', err);
      alert(errorMessage);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get order type color
  const getOrderTypeColor = (type) => {
    return type === 'purchase' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-indigo-100 text-indigo-800';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading order...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link to="/orders" className="text-emerald-600 hover:text-emerald-700">
              ← Back to Orders
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
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link to="/orders" className="text-emerald-600 hover:text-emerald-700">
              ← Back to Orders
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-900">Order not found</h2>
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
            <Link to="/orders" className="mr-4 text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
          </div>
          <div className="flex gap-3">
            {(isAdmin() || isManager()) && order.status !== 'completed' && (
              <>
                <button
                  onClick={() => setStatusModal({ show: true, newStatus: order.status })}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Update Status
                </button>
                {isAdmin() && (
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Details */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Details</h2>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.order_number}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Order Type</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getOrderTypeColor(order.order_type)}`}>
                    {order.order_type}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                  ${parseFloat(order.total_amount || 0).toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Updated At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {order.updated_at ? new Date(order.updated_at).toLocaleString() : '—'}
                </dd>
              </div>
              <div className="lg:col-span-3">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.notes || '—'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
          </div>
          {(!order.items || order.items.length === 0) ? (
            <div className="p-6 text-center text-gray-500">
              No items in this order
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.item_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.sku || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(item.unit_price || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${parseFloat(item.total_price || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    Total:
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    ${parseFloat(order.total_amount || 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </main>

      {/* Status Update Modal */}
      {statusModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={statusModal.newStatus}
                onChange={(e) => setStatusModal(prev => ({ ...prev, newStatus: e.target.value }))}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStatusModal({ show: false, newStatus: '' })}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDetails;
