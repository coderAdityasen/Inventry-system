/**
 * Report Routes - API routes for reports and analytics
 * With proper middleware for authentication and authorization
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// All report routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/v1/reports/inventory-summary
 * @desc    Get inventory summary report
 * @access  All authenticated users
 */
router.get('/inventory-summary', reportController.getInventorySummary);

/**
 * @route   GET /api/v1/reports/inventory-by-category
 * @desc    Get inventory breakdown by category
 * @access  All authenticated users
 */
router.get('/inventory-by-category', reportController.getInventoryByCategory);

/**
 * @route   GET /api/v1/reports/inventory-by-supplier
 * @desc    Get inventory breakdown by supplier
 * @access  All authenticated users
 */
router.get('/inventory-by-supplier', reportController.getInventoryBySupplier);

/**
 * @route   GET /api/v1/reports/low-stock
 * @desc    Get low stock items
 * @access  All authenticated users
 * @query   limit
 */
router.get('/low-stock', reportController.getLowStockItems);

/**
 * @route   GET /api/v1/reports/out-of-stock
 * @desc    Get out of stock items
 * @access  All authenticated users
 * @query   limit
 */
router.get('/out-of-stock', reportController.getOutOfStockItems);

/**
 * @route   GET /api/v1/reports/sales-summary
 * @desc    Get sales summary report
 * @access  Admin/Manager
 * @query   startDate, endDate
 */
router.get('/sales-summary', checkRole(['admin', 'manager']), reportController.getSalesSummary);

/**
 * @route   GET /api/v1/reports/sales-by-date
 * @desc    Get sales by date range
 * @access  Admin/Manager
 * @query   startDate, endDate, groupBy
 */
router.get('/sales-by-date', checkRole(['admin', 'manager']), reportController.getSalesByDate);

/**
 * @route   GET /api/v1/reports/top-selling
 * @desc    Get top selling items
 * @access  Admin/Manager
 * @query   startDate, endDate, limit
 */
router.get('/top-selling', checkRole(['admin', 'manager']), reportController.getTopSellingItems);

/**
 * @route   GET /api/v1/reports/top-suppliers
 * @desc    Get top suppliers by purchase
 * @access  Admin/Manager
 * @query   startDate, endDate, limit
 */
router.get('/top-suppliers', checkRole(['admin', 'manager']), reportController.getTopSuppliers);

/**
 * @route   GET /api/v1/reports/category-performance
 * @desc    Get category performance report
 * @access  Admin/Manager
 * @query   startDate, endDate
 */
router.get('/category-performance', checkRole(['admin', 'manager']), reportController.getCategoryPerformance);

/**
 * @route   GET /api/v1/reports/dashboard-summary
 * @desc    Get dashboard summary
 * @access  All authenticated users
 */
router.get('/dashboard-summary', reportController.getDashboardSummary);

/**
 * @route   GET /api/v1/reports/recent-activity
 * @desc    Get recent activity
 * @access  All authenticated users
 * @query   limit
 */
router.get('/recent-activity', reportController.getRecentActivity);

module.exports = router;