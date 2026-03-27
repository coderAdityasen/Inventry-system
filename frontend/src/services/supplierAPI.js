/**
 * Supplier API Service
 * Handles all supplier-related API calls
 * With detailed console logging for debugging
 */

import api from './api';

const supplierAPI = {
  /**
   * Get all suppliers with optional filters
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @param {boolean} params.isActive - Filter by active status
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   */
  getAll: async (params = {}) => {
    console.log('[API] supplier.getAll - Request params:', params);
    try {
      const response = await api.get('/api/v1/suppliers', { params });
      console.log('[API] supplier.getAll - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] supplier.getAll - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  /**
   * Get single supplier by ID
   * @param {number} id - Supplier ID
   */
  getById: async (id) => {
    console.log('[API] supplier.getById - Request for supplier ID:', id);
    try {
      const response = await api.get(`/api/v1/suppliers/${id}`);
      console.log('[API] supplier.getById - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] supplier.getById - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        supplierId: id
      });
      throw err;
    }
  },

  /**
   * Get supplier with item count
   * @param {number} id - Supplier ID
   */
  getWithItemCount: async (id) => {
    console.log('[API] supplier.getWithItemCount - Request for supplier ID:', id);
    try {
      const response = await api.get(`/api/v1/suppliers/${id}/details`);
      console.log('[API] supplier.getWithItemCount - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] supplier.getWithItemCount - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        supplierId: id
      });
      throw err;
    }
  },

  /**
   * Create new supplier
   * @param {Object} supplierData - Supplier data
   */
  create: async (supplierData) => {
    console.log('[API] supplier.create - Request data:', supplierData);
    try {
      const response = await api.post('/api/v1/suppliers', supplierData);
      console.log('[API] supplier.create - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] supplier.create - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        requestData: supplierData
      });
      throw err;
    }
  },

  /**
   * Update supplier
   * @param {number} id - Supplier ID
   * @param {Object} supplierData - Updated supplier data
   */
  update: async (id, supplierData) => {
    console.log('[API] supplier.update - Request for supplier ID:', id, 'Data:', supplierData);
    try {
      const response = await api.put(`/api/v1/suppliers/${id}`, supplierData);
      console.log('[API] supplier.update - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] supplier.update - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        supplierId: id,
        requestData: supplierData
      });
      throw err;
    }
  },

  /**
   * Toggle supplier status
   * @param {number} id - Supplier ID
   */
  toggleStatus: async (id) => {
    console.log('[API] supplier.toggleStatus - Request for supplier ID:', id);
    try {
      const response = await api.patch(`/api/v1/suppliers/${id}/status`);
      console.log('[API] supplier.toggleStatus - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] supplier.toggleStatus - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        supplierId: id
      });
      throw err;
    }
  },

  /**
   * Delete supplier
   * @param {number} id - Supplier ID
   */
  delete: async (id) => {
    console.log('[API] supplier.delete - Request for supplier ID:', id);
    try {
      const response = await api.delete(`/api/v1/suppliers/${id}`);
      console.log('[API] supplier.delete - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] supplier.delete - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        supplierId: id
      });
      throw err;
    }
  }
};

export default supplierAPI;
