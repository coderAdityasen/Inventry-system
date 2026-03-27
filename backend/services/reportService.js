/**
 * Report Service - Business logic for reports and analytics
 * Implements proper error handling with error codes and debug info
 */

const ReportModel = require('../models/Report');

// Helper function to create error objects
const createError = (message, errorCode, statusCode, debugInfo = {}) => {
  const error = new Error(message);
  error.errorCode = errorCode;
  error.statusCode = statusCode;
  error.debug = {
    ...debugInfo,
    timestamp: new Date().toISOString()
  };
  return error;
};

/**
 * Get inventory summary report
 */
exports.getInventorySummary = async () => {
  try {
    console.log('[SERVICE] getInventorySummary - Starting service');
    const summary = await ReportModel.getInventorySummary();
    console.log('[SERVICE] getInventorySummary - Success, data:', summary);
    return {
      success: true,
      data: summary
    };
  } catch (error) {
    console.error('[SERVICE] getInventorySummary - Error:', error.message);
    throw createError(
      'Failed to get inventory summary',
      'REPORT_500',
      500,
      { service: 'getInventorySummary', originalError: error.message }
    );
  }
};

/**
 * Get inventory by category
 */
exports.getInventoryByCategory = async () => {
  try {
    console.log('[SERVICE] getInventoryByCategory - Starting service');
    const data = await ReportModel.getInventoryByCategory();
    console.log('[SERVICE] getInventoryByCategory - Success, count:', data.length);
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('[SERVICE] getInventoryByCategory - Error:', error.message);
    throw createError(
      'Failed to get inventory by category',
      'REPORT_500',
      500,
      { service: 'getInventoryByCategory', originalError: error.message }
    );
  }
};

/**
 * Get inventory by supplier
 */
exports.getInventoryBySupplier = async () => {
  try {
    console.log('[SERVICE] getInventoryBySupplier - Starting service');
    const data = await ReportModel.getInventoryBySupplier();
    console.log('[SERVICE] getInventoryBySupplier - Success, count:', data.length);
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('[SERVICE] getInventoryBySupplier - Error:', error.message);
    throw createError(
      'Failed to get inventory by supplier',
      'REPORT_500',
      500,
      { service: 'getInventoryBySupplier', originalError: error.message }
    );
  }
};

/**
 * Get low stock items
 */
exports.getLowStockItems = async (limit = 20) => {
  try {
    console.log('[SERVICE] getLowStockItems - Starting service with limit:', limit);
    
    // Validate limit
    if (limit < 1 || limit > 100) {
      throw createError(
        'Limit must be between 1 and 100',
        'REPORT_001',
        400,
        { providedLimit: limit }
      );
    }
    
    const items = await ReportModel.getLowStockItems(limit);
    console.log('[SERVICE] getLowStockItems - Success, count:', items.length);
    return {
      success: true,
      data: items
    };
  } catch (error) {
    console.error('[SERVICE] getLowStockItems - Error:', error.message);
    if (error.errorCode) throw error;
    throw createError(
      'Failed to get low stock items',
      'REPORT_500',
      500,
      { service: 'getLowStockItems', originalError: error.message }
    );
  }
};

/**
 * Get out of stock items
 */
exports.getOutOfStockItems = async (limit = 20) => {
  try {
    console.log('[SERVICE] getOutOfStockItems - Starting service with limit:', limit);
    
    // Validate limit
    if (limit < 1 || limit > 100) {
      throw createError(
        'Limit must be between 1 and 100',
        'REPORT_001',
        400,
        { providedLimit: limit }
      );
    }
    
    const items = await ReportModel.getOutOfStockItems(limit);
    console.log('[SERVICE] getOutOfStockItems - Success, count:', items.length);
    return {
      success: true,
      data: items
    };
  } catch (error) {
    console.error('[SERVICE] getOutOfStockItems - Error:', error.message);
    if (error.errorCode) throw error;
    throw createError(
      'Failed to get out of stock items',
      'REPORT_500',
      500,
      { service: 'getOutOfStockItems', originalError: error.message }
    );
  }
};

/**
 * Get sales summary report
 */
exports.getSalesSummary = async (startDate = null, endDate = null) => {
  try {
    console.log('[SERVICE] getSalesSummary - Starting service');
    console.log('[SERVICE] getSalesSummary - Date range:', { startDate, endDate });
    
    // Validate date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw createError(
          'Invalid date format',
          'REPORT_001',
          400,
          { startDate, endDate }
        );
      }
      
      if (start > end) {
        throw createError(
          'Start date must be before end date',
          'REPORT_001',
          400,
          { startDate, endDate }
        );
      }
    }
    
    const summary = await ReportModel.getSalesSummary(startDate, endDate);
    console.log('[SERVICE] getSalesSummary - Success, data:', summary);
    return {
      success: true,
      data: summary
    };
  } catch (error) {
    console.error('[SERVICE] getSalesSummary - Error:', error.message);
    if (error.errorCode) throw error;
    throw createError(
      'Failed to get sales summary',
      'REPORT_500',
      500,
      { service: 'getSalesSummary', originalError: error.message }
    );
  }
};

/**
 * Get sales by date range
 */
exports.getSalesByDate = async (startDate, endDate, groupBy = 'day') => {
  try {
    console.log('[SERVICE] getSalesByDate - Starting service');
    console.log('[SERVICE] getSalesByDate - Params:', { startDate, endDate, groupBy });
    
    // Validate required dates
    if (!startDate || !endDate) {
      throw createError(
        'Start date and end date are required',
        'REPORT_001',
        400,
        { startDate, endDate }
      );
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw createError(
        'Invalid date format',
        'REPORT_001',
        400,
        { startDate, endDate }
      );
    }
    
    if (start > end) {
      throw createError(
        'Start date must be before end date',
        'REPORT_001',
        400,
        { startDate, endDate }
      );
    }
    
    // Validate groupBy
    const validGroupBy = ['day', 'week', 'month'];
    if (!validGroupBy.includes(groupBy)) {
      throw createError(
        'Invalid groupBy value. Must be day, week, or month',
        'REPORT_001',
        400,
        { groupBy }
      );
    }
    
    const data = await ReportModel.getSalesByDate(startDate, endDate, groupBy);
    console.log('[SERVICE] getSalesByDate - Success, count:', data.length);
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('[SERVICE] getSalesByDate - Error:', error.message);
    if (error.errorCode) throw error;
    throw createError(
      'Failed to get sales by date',
      'REPORT_500',
      500,
      { service: 'getSalesByDate', originalError: error.message }
    );
  }
};

/**
 * Get top selling items
 */
exports.getTopSellingItems = async (startDate = null, endDate = null, limit = 10) => {
  try {
    console.log('[SERVICE] getTopSellingItems - Starting service');
    console.log('[SERVICE] getTopSellingItems - Params:', { startDate, endDate, limit });
    
    // Validate limit
    if (limit < 1 || limit > 50) {
      throw createError(
        'Limit must be between 1 and 50',
        'REPORT_001',
        400,
        { providedLimit: limit }
      );
    }
    
    const items = await ReportModel.getTopSellingItems(startDate, endDate, limit);
    console.log('[SERVICE] getTopSellingItems - Success, count:', items.length);
    return {
      success: true,
      data: items
    };
  } catch (error) {
    console.error('[SERVICE] getTopSellingItems - Error:', error.message);
    if (error.errorCode) throw error;
    throw createError(
      'Failed to get top selling items',
      'REPORT_500',
      500,
      { service: 'getTopSellingItems', originalError: error.message }
    );
  }
};

/**
 * Get top suppliers by purchase
 */
exports.getTopSuppliers = async (startDate = null, endDate = null, limit = 10) => {
  try {
    console.log('[SERVICE] getTopSuppliers - Starting service');
    console.log('[SERVICE] getTopSuppliers - Params:', { startDate, endDate, limit });
    
    // Validate limit
    if (limit < 1 || limit > 50) {
      throw createError(
        'Limit must be between 1 and 50',
        'REPORT_001',
        400,
        { providedLimit: limit }
      );
    }
    
    const suppliers = await ReportModel.getTopSuppliers(startDate, endDate, limit);
    console.log('[SERVICE] getTopSuppliers - Success, count:', suppliers.length);
    return {
      success: true,
      data: suppliers
    };
  } catch (error) {
    console.error('[SERVICE] getTopSuppliers - Error:', error.message);
    if (error.errorCode) throw error;
    throw createError(
      'Failed to get top suppliers',
      'REPORT_500',
      500,
      { service: 'getTopSuppliers', originalError: error.message }
    );
  }
};

/**
 * Get category performance
 */
exports.getCategoryPerformance = async (startDate = null, endDate = null) => {
  try {
    console.log('[SERVICE] getCategoryPerformance - Starting service');
    console.log('[SERVICE] getCategoryPerformance - Date range:', { startDate, endDate });
    
    const data = await ReportModel.getCategoryPerformance(startDate, endDate);
    console.log('[SERVICE] getCategoryPerformance - Success, count:', data.length);
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('[SERVICE] getCategoryPerformance - Error:', error.message);
    throw createError(
      'Failed to get category performance',
      'REPORT_500',
      500,
      { service: 'getCategoryPerformance', originalError: error.message }
    );
  }
};

/**
 * Get dashboard summary
 */
exports.getDashboardSummary = async () => {
  try {
    console.log('[SERVICE] getDashboardSummary - Starting service');
    const summary = await ReportModel.getDashboardSummary();
    console.log('[SERVICE] getDashboardSummary - Success');
    return {
      success: true,
      data: summary
    };
  } catch (error) {
    console.error('[SERVICE] getDashboardSummary - Error:', error.message);
    throw createError(
      'Failed to get dashboard summary',
      'REPORT_500',
      500,
      { service: 'getDashboardSummary', originalError: error.message }
    );
  }
};

/**
 * Get recent activity
 */
exports.getRecentActivity = async (limit = 10) => {
  try {
    console.log('[SERVICE] getRecentActivity - Starting service with limit:', limit);
    
    // Validate limit
    if (limit < 1 || limit > 50) {
      throw createError(
        'Limit must be between 1 and 50',
        'REPORT_001',
        400,
        { providedLimit: limit }
      );
    }
    
    const activity = await ReportModel.getRecentActivity(limit);
    console.log('[SERVICE] getRecentActivity - Success, count:', activity.length);
    return {
      success: true,
      data: activity
    };
  } catch (error) {
    console.error('[SERVICE] getRecentActivity - Error:', error.message);
    if (error.errorCode) throw error;
    throw createError(
      'Failed to get recent activity',
      'REPORT_500',
      500,
      { service: 'getRecentActivity', originalError: error.message }
    );
  }
};