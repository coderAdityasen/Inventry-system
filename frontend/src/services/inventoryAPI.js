import api from './api';

/**
 * Inventory API Service
 * Handles all inventory-related API calls
 * With detailed console logging for debugging
 */

const inventoryAPI = {
  /**
   * Get all items with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {number} params.category - Category filter
   * @param {number} params.supplier - Supplier filter
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order
   */
  getAll: async (params = {}) => {
    console.log('[API] getAll - Request params:', params);
    try {
      const response = await api.get('/api/v1/items', { params });
      console.log('[API] getAll - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] getAll - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  /**
   * Get single item by ID
   * @param {number} id - Item ID
   */
  getById: async (id) => {
    console.log('[API] getById - Request for item ID:', id);
    try {
      const response = await api.get(`/api/v1/items/${id}`);
      console.log('[API] getById - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] getById - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        itemId: id
      });
      throw err;
    }
  },

  /**
   * Create new item
   * @param {Object} itemData - Item data
   */
  create: async (itemData) => {
    console.log('[API] create - Request data:', itemData);
    try {
      const response = await api.post('/api/v1/items', itemData);
      console.log('[API] create - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] create - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        requestData: itemData
      });
      throw err;
    }
  },

  /**
   * Update item
   * @param {number} id - Item ID
   * @param {Object} itemData - Updated item data
   */
  update: async (id, itemData) => {
    console.log('[API] update - Request for item ID:', id, 'Data:', itemData);
    try {
      const response = await api.put(`/api/v1/items/${id}`, itemData);
      console.log('[API] update - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] update - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        itemId: id,
        requestData: itemData
      });
      throw err;
    }
  },

  /**
   * Delete item
   * @param {number} id - Item ID
   */
  delete: async (id) => {
    console.log('[API] delete - Request for item ID:', id);
    try {
      const response = await api.delete(`/api/v1/items/${id}`);
      console.log('[API] delete - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] delete - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        itemId: id
      });
      throw err;
    }
  },

  /**
   * Get low stock items
   * @param {number} threshold - Stock threshold
   */
  getLowStock: async (threshold = 10) => {
    console.log('[API] getLowStock - Threshold:', threshold);
    try {
      const response = await api.get('/api/v1/items/low-stock', { 
        params: { threshold } 
      });
      console.log('[API] getLowStock - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] getLowStock - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  /**
   * Search items
   * @param {string} query - Search query
   */
  search: async (query) => {
    console.log('[API] search - Query:', query);
    try {
      const response = await api.get('/api/v1/items/search', { 
        params: { q: query } 
      });
      console.log('[API] search - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] search - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  // =====================
  // Category API methods
  // =====================
  getAllCategories: async () => {
    console.log('[API] getAllCategories - Request');
    try {
      const response = await api.get('/api/v1/categories');
      console.log('[API] getAllCategories - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] getAllCategories - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  // =====================
  // Supplier API methods
  // =====================
  getAllSuppliers: async () => {
    console.log('[API] getAllSuppliers - Request');
    try {
      const response = await api.get('/api/v1/suppliers');
      console.log('[API] getAllSuppliers - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] getAllSuppliers - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    console.log('[API] deleteCategory - Request for category ID:', id);
    try {
      const response = await api.get(`/api/v1/categories/${id}`);
      console.log('[API] getCategoryById - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] getCategoryById - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        categoryId: id
      });
      throw err;
    }
  },

  createCategory: async (categoryData) => {
    console.log('[API] createCategory - Request data:', categoryData);
    try {
      const response = await api.post('/api/v1/categories', categoryData);
      console.log('[API] createCategory - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] createCategory - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        requestData: categoryData
      });
      throw err;
    }
  },

  updateCategory: async (id, categoryData) => {
    console.log('[API] updateCategory - Request for category ID:', id, 'Data:', categoryData);
    try {
      const response = await api.put(`/api/v1/categories/${id}`, categoryData);
      console.log('[API] updateCategory - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] updateCategory - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        categoryId: id,
        requestData: categoryData
      });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    console.log('[API] deleteCategory - Request for category ID:', id);
    try {
      const response = await api.delete(`/api/v1/categories/${id}`);
      console.log('[API] deleteCategory - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] deleteCategory - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        categoryId: id
      });
      throw err;
    }
  },

  // =====================
  // Image Upload
  // =====================
  uploadImage: async (file) => {
    console.log('[API] uploadImage - Uploading image:', file?.name);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'products');
      
      const response = await api.post('/api/v1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('[API] uploadImage - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] uploadImage - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  // =====================
  // Inventory Stats
  // =====================
  getStats: async () => {
    console.log('[API] getStats - Request');
    try {
      const response = await api.get('/api/v1/items/stats');
      console.log('[API] getStats - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] getStats - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  }
};

export default inventoryAPI;