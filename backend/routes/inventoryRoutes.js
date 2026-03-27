/**
 * Inventory Routes - API routes for inventory items
 * With proper middleware for authentication and authorization
 */

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// All inventory routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/v1/items
 * @desc    Get all items with pagination and filters
 * @access  Protected
 * @query   page, limit, search, category, supplier, sortBy, sortOrder
 */
router.get('/', inventoryController.getAllItems);

/**
 * @route   GET /api/v1/items/low-stock
 * @desc    Get low stock items
 * @access  Protected
 * @query   threshold
 */
router.get('/low-stock', inventoryController.getLowStock);

/**
 * @route   GET /api/v1/items/search
 * @desc    Search items
 * @access  Protected
 * @query   q
 */
router.get('/search', inventoryController.searchItems);

/**
 * @route   GET /api/v1/items/:id
 * @desc    Get single item by ID
 * @access  Protected
 * @params  id
 */
router.get('/:id', inventoryController.getItemById);

/**
 * @route   POST /api/v1/items
 * @desc    Create new item
 * @access  Admin/Manager
 * @body    name, sku, description, quantity, price, category_id, supplier_id, low_stock_threshold, image_url
 */
router.post('/', checkRole(['admin', 'manager']), inventoryController.createItem);

/**
 * @route   PUT /api/v1/items/:id
 * @desc    Update item
 * @access  Admin/Manager
 * @params  id
 * @body    name, sku, description, quantity, price, category_id, supplier_id, low_stock_threshold, image_url
 */
router.put('/:id', checkRole(['admin', 'manager']), inventoryController.updateItem);

/**
 * @route   DELETE /api/v1/items/:id
 * @desc    Delete item
 * @access  Admin only
 * @params  id
 */
router.delete('/:id', checkRole(['admin']), inventoryController.deleteItem);

module.exports = router;