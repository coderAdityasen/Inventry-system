/**
 * Order Routes - API routes for orders
 * With proper middleware for authentication and authorization
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// All order routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders with pagination and filters
 * @access  Protected
 */
router.get('/', orderController.getAllOrders);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Protected
 */
router.get('/:id', orderController.getOrderById);

/**
 * @route   POST /api/v1/orders
 * @desc    Create new order
 * @access  Admin/Manager
 */
router.post('/', checkRole(['admin', 'manager']), orderController.createOrder);

/**
 * @route   PUT /api/v1/orders/:id
 * @desc    Update order
 * @access  Admin/Manager
 */
router.put('/:id', checkRole(['admin', 'manager']), orderController.updateOrder);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Admin/Manager
 */
router.patch('/:id/status', checkRole(['admin', 'manager']), orderController.updateOrderStatus);

/**
 * @route   DELETE /api/v1/orders/:id
 * @desc    Delete order
 * @access  Admin only
 */
router.delete('/:id', checkRole(['admin']), orderController.deleteOrder);

module.exports = router;
