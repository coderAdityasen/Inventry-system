/**
 * Report Controller - Request handlers for reports and analytics
 * With detailed console logging for debugging and proper error handling
 */

const reportService = require('../services/reportService');

/**
 * Get inventory summary report
 * @route GET /api/v1/reports/inventory-summary
 * @access All authenticated users
 */
exports.getInventorySummary = async (req, res) => {
  try {
    console.log('[CONTROLLER] getInventorySummary - Starting controller');
    console.log('[CONTROLLER] getInventorySummary - User:', req.user?.email);
    console.log('[CONTROLLER] getInventorySummary - User role:', req.user?.role);
    
    const result = await reportService.getInventorySummary();
    
    console.log('[CONTROLLER] getInventorySummary - Response success:', result.success);
    console.log('[CONTROLLER] getInventorySummary - Data:', result.data);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[CONTROLLER] getInventorySummary - Error:', error.message);
    console.error('[CONTROLLER] getInventorySummary - Error code:', error.errorCode);
    console.error('[CONTROLLER] getInventorySummary - Status code:', error.statusCode);
    
    res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || 'REPORT_500',
      message: error.message,
      debug: error.debug
    });
  }
};

/**
 * Get inventory by category
 * @route GET /api/v1/reports/inventory-by-category
 * @access All authenticated users
 */
exports.getInventoryByCategory = async (req, res) => {
  try {
    console.log('[CONTROLLER] getInventoryByCategory - Starting controller');
    console.log('[CONTROLLER] getInventoryByCategory - User:', req.user?.email);
    
    const result = await reportService.getInventoryByCategory();
    
    console.log('[CONTROLLER] getInventoryByCategory - Response success:', result.success);
    console.log('[CONTROLLER] getInventoryByCategory - Data count:', result.data.length);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[CONTROLLER] getInventoryByCategory - Error:', error.message);
    console.error('[CONTROLLER] getInventoryByCategory - Error code:', error.errorCode);
    
    res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || 'REPORT_500',
      message: error.message,
      debug: error.debug
    });
  }
};

/**
 * Get inventory by supplier
 * @route GET /api/v1/reports/inventory-by-supplier
 * @access All authenticated users
 */
exports.getInventoryBySupplier = async (req, res) => {
  try {
    console.log('[CONTROLLER] getInventoryBySupplier - Starting controller');
    console.log('[CONTROLLER] getInventoryBySupplier - User:', req.user?.email);
    
    const result = await reportService.getInventoryBySupplier();
    
    console.log('[CONTROLLER] getInventoryBySupplier - Response success:', result.success);
    console.log('[CONTROLLER] getInventoryBySupplier - Data count:', result.data.length);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[CONTROLLER] getInventoryBySupplier - Error:', error.message);
    console.error('[CONTROLLER] getInventoryBySupplier - Error code:', error.errorCode);
    
    res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || 'REPORT_500',
      message: error.message,
      debug: error.debug
    });
  }
};

/**
 * Get low stock items
 * @route GET /api/v1/reports/low-stock
 * @access All authenticated users
 */
exports.getLowStockItems = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    console.log('[CONTROLLER] getLowStockItems - Starting controller');
    console.log('[CONTROLLER] getLowStockItems - Query params:', req.query);
    console.log('[CONTROLLER] getLowStockItems - User:', req.user?.email);
    
    const result = await reportService.getLowStockItems(parseInt(limit));
    
    console.log('[CONTROLLER] getLowStockItems - Response success:', result.success);
    console.log('[CONTROLLER] getLowStockItems - Data count:', result.data.length);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[CONTROLLER] getLowStockItems - Error:', error.message);
    console.error('[CONTROLLER] getLowStockItems - Error code:', error.errorCode);
    
    res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || 'REPORT_500',
      message: error.message,
      debug: error.debug
    });
  }
};

/**
 * Get out of stock items
 * @route GET /api/v1/reports/out-of-stock
 * @access All authenticated users
 */
exports.getOutOfStockItems = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    console.log('[CONTROLLER] getOutOfStockItems - Starting controller');
    console.log('[CONTROLLER] getOutOfStockItems - Query params:', req.query);
    console.log('[CONTROLLER] getOutOfStockItems - User:', req.user?.email);
    
    const result = await reportService.getOutOfStockItems(parseInt(limit));
    
    console.log('[CONTROLLER] getOutOfStockItems - Response success:', result.success);
    console.log('[CONTROLLER] getOutOfStockItems - Data count:', result.data.length);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[CONTROLLER] getOutOfStockItems - Error:', error.message);
    console.error('[CONTROLLER] getOutOfStockItems - Error code:', error.errorCode);
    
    res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || 'REPORT_500',
      message: error.message,
      debug: error.debug
    });
  }
};

/**
 * Get sales summary report
 * @route GET /api/v1/reports/sales-summary
 * @access Admin/Manager
 */
exports.getSalesSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log('[CONTROLLER] getSalesSummary - Starting controller');
    console.log('[CONTROLLER] getSalesSummary - Query params:', req.query);
    console.log('[CONTROLLER] getSalesSummary - User:', req.user?.email);
    console.log('[CONTROLLER] getSalesSummary - User role:', req.user?.role);
    
    const result = await reportService.getSalesSummary(startDate, endDate);
    
    console.log('[CONTROLLER] getSalesSummary - Response success:', result.success);
    console.log('[CONTROLLER] getSalesSummary - Data:', result.data);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[CONTROLLER] getSalesSummary - Error:', error.message);
    console.error('[CONTROLLER] getSalesSummary - Error code:', error.errorCode);
    
    res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || 'REPORT_500',
      message: error.message,
      debug: error.debug
    });
  }
};

/**
 * Get sales by date range
 * @route GET /api/v1/reports/sales-by-date
 * @access Admin/Manager
 */
exports.getSalesByDate = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    console.log('[CONTROLLER] getSalesByDate - Starting controller');
    console.log('[CONTROLLER] getSalesByDate - Query params:', req.query);
    console.log('[CONTROLLER] getSalesByDate - User:', req.user?.email);
    console.log('[CONTROLLER] getSalesByDate - User role:', req.user?.role);
    
    if (!startDate || !endDate) {
      console.log('[CONTROLLER] getSalesByDate - Missing required parameters');
      return res.status(400).json({
        success: false,
        errorCode: 'REPORT_001',
        message: 'Start date and end date are required'
      });
    }
    
    const result = await reportService.getSalesByDate(startDate, endDate, groupBy);
    
    console.log('[CONTROLLER] getSalesByDate - Response success:', result.success);
    console.log('[CONTROLLER] getSalesByDate - Data count:', result.data.length);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[CONTROLLER] getSalesByDate - Error:', error.message);
    console.error('[CONTROLLER] getSalesByDate - Error code:', error.errorCode);
    
    res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || 'REPORT_500',
      message: error.message,
      debug: error.debug
    });
  }
};

/**
 * Get top selling items
 * @route GET /api/v1/reports/top-selling
 * @access Admin/Manager
 */
exports.getTopSellingItems = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    console.log('[CONTROLLER] getTopSellingItems - Starting controller');
    console.log('[CONTROLLER] getTopSellingItems - Query params:', req.query);
    console.log('[CONTROLLER] getTopSellingItems - User:', req.user?.email);
    console.log('[CONTROLLER] getTopSellingItems - User role:', req.user?.role);
    
    const result = await reportService.getTopSellingItems(startDate, endDate, parseInt(limit));
    
    console.log('[CONTROLLER] getTopSellingItems - Response success:', result.success);
    console.log('[CONTROLLER] getTopSellingItems - Data count:', result.data.length);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[CONTROLLER] getTopSellingItems - Error:', error.message);
    console.error('[CONTROLLER] getTopSellingItems - Error code:', error.errorCode);
    
    res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || 'REPORT_500',
      message: error.message,
      debug: error.debug
    });
  }
};

/**
 * Get top suppliers
 * @route GET /api/v1/reports/top-suppliers
 * @access Admin/Manager
 */
exports.getTopSuppliers = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    console.log('[CONTROLLER] getTopSuppliers - Starting controller');
    console.log('[CONTROLLER] getTopSuppliers - Query params:', req.query);
    console.log('[CONTROLLER] getTopSuppliers - User:', req.user?.email);
    console.log('[CONTROLLER] getTopSuppliers - User role:', req.user?.role);
    
    const result = await reportService.getTopSuppliers(startDate, endDate, parseInt(limit));
    
    console.log('[CONTROLLER] getTopSuppliers - Response success:', result.success);
    console.log('[CONTROLLER] getTopSuppliers - Data count:', result.data.length);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[CONTROLLER] getTopSuppliers - Error:', error.message);
    console.error('[CONTROLLER] getTopSuppliers - Error code:', error.errorCode);
    
    res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || 'REPORT_500',
      message: error.message,
      debug: error.debug
    });
  }
};

/**
 * Get category performance
 * @route GET /api/v1/reports/category-performance
 * @access Admin/Manager
 */
exports.getCategoryPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log('[CONTROLLER] getCategoryPerformance - Starting controller');
    console.log('[CONTROLLER] getCategoryPerformance - Query params:', req.query);
    console.log('[CONTROLLER] getCategoryPerformance - User:', req.user?.email);
    console.log('[CONTROLLER] getCategoryPerformance - User role:', req.user?.role);
    
    const result = await reportService.getCategoryPerformance(startDate, endDate);
    
    console.log('[CONTROLLER] getCategoryPerformance - Response success:', result.success);
    console.log('[CONTROLLER] getCategoryPerformance - Data count:', result.data.length);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[CONTROLLER] getCategoryPerformance - Error:', error.message);
    console.error('[CONTROLLER] getCategoryPerformance - Error code:', error.errorCode);
    
    res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || 'REPORT_500',
      message: error.message,
      debug: error.debug
    });
  }
};

/**
 * Get dashboard summary
 * @route GET /api/v1/reports/dashboard-summary
 * @access All authenticated users
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    console.log('[CONTROLLER] getDashboardSummary - Starting controller');
    console.log('[CONTROLLER] getDashboardSummary - User:', req.user?.email);
    console.log('[CONTROLLER] getDashboardSummary - User role:', req.user?.role);
    
    const result = await reportService.getDashboardSummary();
    
    console.log('[CONTROLLER] getDashboardSummary - Response success:', result.success);
    console.log('[CONTROLLER] getDashboardSummary - Data keys:', Object.keys(result.data));
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[CONTROLLER] getDashboardSummary - Error:', error.message);
    console.error('[CONTROLLER] getDashboardSummary - Error code:', error.errorCode);
    
    res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || 'REPORT_500',
      message: error.message,
      debug: error.debug
    });
  }
};

/**
 * Get recent activity
 * @route GET /api/v1/reports/recent-activity
 * @access All authenticated users
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    console.log('[CONTROLLER] getRecentActivity - Starting controller');
    console.log('[CONTROLLER] getRecentActivity - Query params:', req.query);
    console.log('[CONTROLLER] getRecentActivity - User:', req.user?.email);
    
    const result = await reportService.getRecentActivity(parseInt(limit));
    
    console.log('[CONTROLLER] getRecentActivity - Response success:', result.success);
    console.log('[CONTROLLER] getRecentActivity - Data count:', result.data.length);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[CONTROLLER] getRecentActivity - Error:', error.message);
    console.error('[CONTROLLER] getRecentActivity - Error code:', error.errorCode);
    
    res.status(error.statusCode || 500).json({
      success: false,
      errorCode: error.errorCode || 'REPORT_500',
      message: error.message,
      debug: error.debug
    });
  }
};