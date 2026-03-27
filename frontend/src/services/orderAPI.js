import api from './api';

/**
 * Order API Service
 * Handles all order-related API calls
 * With detailed console logging for debugging
 */

const orderAPI = {
  /**
   * Get all orders with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {string} params.status - Status filter
   * @param {string} params.orderType - Order type filter
   */
  getAll: async (params = {}) => {
    console.log('[API] order.getAll - Request params:', params);
    try {
      const response = await api.get('/api/v1/orders', { params });
      console.log('[API] order.getAll - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] order.getAll - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  /**
   * Get single order by ID
   * @param {number} id - Order ID
   */
  getById: async (id) => {
    console.log('[API] order.getById - Request for order ID:', id);
    try {
      const response = await api.get(`/api/v1/orders/${id}`);
      console.log('[API] order.getById - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] order.getById - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        orderId: id
      });
      throw err;
    }
  },

  /**
   * Create new order
   * @param {Object} orderData - Order data
   */
  create: async (orderData) => {
    console.log('[API] order.create - Request data:', orderData);
    try {
      const response = await api.post('/api/v1/orders', orderData);
      console.log('[API] order.create - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] order.create - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        requestData: orderData
      });
      throw err;
    }
  },

  /**
   * Update order
   * @param {number} id - Order ID
   * @param {Object} orderData - Updated order data
   */
  update: async (id, orderData) => {
    console.log('[API] order.update - Request for order ID:', id, 'Data:', orderData);
    try {
      const response = await api.put(`/api/v1/orders/${id}`, orderData);
      console.log('[API] order.update - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] order.update - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        orderId: id,
        requestData: orderData
      });
      throw err;
    }
  },

  /**
   * Update order status
   * @param {number} id - Order ID
   * @param {string} status - New status
   */
  updateStatus: async (id, status) => {
    console.log('[API] order.updateStatus - Request for order ID:', id, 'Status:', status);
    try {
      const response = await api.patch(`/api/v1/orders/${id}/status`, { status });
      console.log('[API] order.updateStatus - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] order.updateStatus - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        orderId: id,
        status: status
      });
      throw err;
    }
  },

  /**
   * Delete order
   * @param {number} id - Order ID
   */
  delete: async (id) => {
    console.log('[API] order.delete - Request for order ID:', id);
    try {
      const response = await api.delete(`/api/v1/orders/${id}`);
      console.log('[API] order.delete - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] order.delete - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        orderId: id
      });
      throw err;
    }
  }
};

export default orderAPI;
