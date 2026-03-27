import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import orderAPI from '../../services/orderAPI';

/**
 * OrderList Page - Main order view with CRUD operations
 * Modern UI with search, filters, pagination, and role-based actions
 */
function OrderList() {
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  
  // State management
  const [orders, setOrders] = useState([]);
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
    status: '',
    orderType: ''
  });

  // Modal state for status update
  const [statusModal, setStatusModal] = useState({ show: false, orderId: null, orderNumber: '', newStatus: '' });

  // Modal state for delete confirmation
  const [deleteModal, setDeleteModal] = useState({ show: false, orderId: null, orderNumber: '' });

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[OrderList] Fetching orders with filters:', filters);
      
      const response = await orderAPI.getAll({
        page: pagination.currentPage,
        limit: 10,
        search: filters.search,
        status: filters.status || null,
        orderType: filters.orderType || null
      });
      
      if (response.success) {
        console.log('[OrderList] Orders fetched:', response.data.length);
        setOrders(response.data);
        setPagination(prev => ({
          ...prev,
          totalItems: response.data.length,
          totalPages: Math.ceil(response.data.length / 10)
        }));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errorCode || 'Failed to fetch orders';
      setError(errorMessage);
      console.error('[OrderList] Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters]);

  // Initial load and filter changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.currentPage !== 1) {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      } else {
        fetchOrders();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle status update click
  const handleStatusClick = (order) => {
    setStatusModal({
      show: true,
      orderId: order.id,
      orderNumber: order.order_number,
      newStatus: order.status
    });
  };

  // Confirm status update
  const confirmStatusUpdate = async () => {
    try {
      console.log('[OrderList] Updating order status:', statusModal.orderId, statusModal.newStatus);
      await orderAPI.updateStatus(statusModal.orderId, statusModal.newStatus);
      console.log('[OrderList] Order status updated successfully');
      setStatusModal({ show: false, orderId: null, orderNumber: '', newStatus: '' });
      fetchOrders();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errorCode || 'Failed to update order status';
      console.error('[OrderList] Status update error:', err);
      alert(errorMessage);
    }
  };

  // Handle delete click
  const handleDeleteClick = (order) => {
    setDeleteModal({
      show: true,
      orderId: order.id,
      orderNumber: order.order_number
    });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      console.log('[OrderList] Deleting order ID:', deleteModal.orderId);
      await orderAPI.delete(deleteModal.orderId);
      console.log('[OrderList] Order deleted successfully');
      setDeleteModal({ show: false, orderId: null, orderNumber: '' });
      fetchOrders();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errorCode || 'Failed to delete order';
      console.error('[OrderList] Delete error:', err);
      alert(errorMessage);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-4 text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          </div>
          {(isAdmin() || isManager()) && (
            <Link
              to="/orders/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
            >
              + Create Order
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
                placeholder="Search orders..."
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="sm:w-40">
              <select
                name="orderType"
                value={filters.orderType}
                onChange={handleFilterChange}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Types</option>
                <option value="purchase">Purchase</option>
                <option value="sale">Sale</option>
              </select>
            </div>
            <div className="sm:w-40">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
            <div className="text-gray-500">Loading orders...</div>
          </div>
        )}

        {/* Orders Table */}
        {!loading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getOrderTypeColor(order.order_type)}`}>
                          {order.order_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${parseFloat(order.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.item_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/orders/${order.id}`}
                          className="text-emerald-600 hover:text-emerald-900 mr-4"
                        >
                          View
                        </Link>
                        {(isAdmin() || isManager()) && order.status !== 'completed' && (
                          <>
                            <button
                              onClick={() => handleStatusClick(order)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Status
                            </button>
                            {isAdmin() && (
                              <button
                                onClick={() => handleDeleteClick(order)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {orders.length > pagination.itemsPerPage && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, orders.length)} of {orders.length} results
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

      {/* Status Update Modal */}
      {statusModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h3>
            <p className="text-gray-600 mb-4">
              Order: <span className="font-medium">{statusModal.orderNumber}</span>
            </p>
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
                onClick={() => setStatusModal({ show: false, orderId: null, orderNumber: '', newStatus: '' })}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete order "{deleteModal.orderNumber}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, orderId: null, orderNumber: '' })}
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

export default OrderList;
