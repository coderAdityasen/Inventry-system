/**
 * Report API Service
 * Handles all report-related API calls
 * With detailed console logging for debugging
 */

import api from './api';

const reportAPI = {
  /**
   * Get inventory summary report
   */
  getInventorySummary: async () => {
    console.log('[API] report.getInventorySummary - Request started');
    try {
      const response = await api.get('/api/v1/reports/inventory-summary');
      console.log('[API] report.getInventorySummary - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] report.getInventorySummary - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  /**
   * Get inventory by category
   */
  getInventoryByCategory: async () => {
    console.log('[API] report.getInventoryByCategory - Request started');
    try {
      const response = await api.get('/api/v1/reports/inventory-by-category');
      console.log('[API] report.getInventoryByCategory - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] report.getInventoryByCategory - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  /**
   * Get inventory by supplier
   */
  getInventoryBySupplier: async () => {
    console.log('[API] report.getInventoryBySupplier - Request started');
    try {
      const response = await api.get('/api/v1/reports/inventory-by-supplier');
      console.log('[API] report.getInventoryBySupplier - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] report.getInventoryBySupplier - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  /**
   * Get low stock items
   * @param {number} limit - Number of items to return
   */
  getLowStockItems: async (limit = 20) => {
    console.log('[API] report.getLowStockItems - Request with limit:', limit);
    try {
      const response = await api.get('/api/v1/reports/low-stock', { params: { limit } });
      console.log('[API] report.getLowStockItems - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] report.getLowStockItems - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  /**
   * Get out of stock items
   * @param {number} limit - Number of items to return
   */
  getOutOfStockItems: async (limit = 20) => {
    console.log('[API] report.getOutOfStockItems - Request with limit:', limit);
    try {
      const response = await api.get('/api/v1/reports/out-of-stock', { params: { limit } });
      console.log('[API] report.getOutOfStockItems - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] report.getOutOfStockItems - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  /**
   * Get sales summary report
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   */
  getSalesSummary: async (startDate = null, endDate = null) => {
    console.log('[API] report.getSalesSummary - Request with date range:', { startDate, endDate });
    try {
      const response = await api.get('/api/v1/reports/sales-summary', { 
        params: { startDate, endDate } 
      });
      console.log('[API] report.getSalesSummary - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] report.getSalesSummary - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  /**
   * Get sales by date
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {string} groupBy - Group by day/week/month
   */
  getSalesByDate: async (startDate, endDate, groupBy = 'day') => {
    console.log('[API] report.getSalesByDate - Request with params:', { startDate, endDate, groupBy });
    try {
      const response = await api.get('/api/v1/reports/sales-by-date', { 
        params: { startDate, endDate, groupBy } 
      });
      console.log('[API] report.getSalesByDate - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] report.getSalesByDate - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  /**
   * Get top selling items
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {number} limit - Number of items to return
   */
  getTopSellingItems: async (startDate = null, endDate = null, limit = 10) => {
    console.log('[API] report.getTopSellingItems - Request with params:', { startDate, endDate, limit });
    try {
      const response = await api.get('/api/v1/reports/top-selling', { 
        params: { startDate, endDate, limit } 
      });
      console.log('[API] report.getTopSellingItems - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] report.getTopSellingItems - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  /**
   * Get top suppliers
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {number} limit - Number of suppliers to return
   */
  getTopSuppliers: async (startDate = null, endDate = null, limit = 10) => {
    console.log('[API] report.getTopSuppliers - Request with params:', { startDate, endDate, limit });
    try {
      const response = await api.get('/api/v1/reports/top-suppliers', { 
        params: { startDate, endDate, limit } 
      });
      console.log('[API] report.getTopSuppliers - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] report.getTopSuppliers - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  /**
   * Get category performance
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   */
  getCategoryPerformance: async (startDate = null, endDate = null) => {
    console.log('[API] report.getCategoryPerformance - Request with date range:', { startDate, endDate });
    try {
      const response = await api.get('/api/v1/reports/category-performance', { 
        params: { startDate, endDate } 
      });
      console.log('[API] report.getCategoryPerformance - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] report.getCategoryPerformance - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  /**
   * Get dashboard summary
   */
  getDashboardSummary: async () => {
    console.log('[API] report.getDashboardSummary - Request started');
    try {
      const response = await api.get('/api/v1/reports/dashboard-summary');
      console.log('[API] report.getDashboardSummary - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] report.getDashboardSummary - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  },

  /**
   * Get recent activity
   * @param {number} limit - Number of activities to return
   */
  getRecentActivity: async (limit = 10) => {
    console.log('[API] report.getRecentActivity - Request with limit:', limit);
    try {
      const response = await api.get('/api/v1/reports/recent-activity', { 
        params: { limit } 
      });
      console.log('[API] report.getRecentActivity - Response success:', response.data.success);
      return response.data;
    } catch (err) {
      console.error('[API] report.getRecentActivity - Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      throw err;
    }
  }
};

export default reportAPI;