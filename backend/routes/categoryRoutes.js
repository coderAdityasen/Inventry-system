/**
 * Category Routes - API routes for categories
 * With proper middleware for authentication and authorization
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// All category routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories
 * @access  Protected
 */
router.get('/', categoryController.getAllCategories);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID
 * @access  Protected
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @route   POST /api/v1/categories
 * @desc    Create new category
 * @access  Admin/Manager
 */
router.post('/', checkRole(['admin', 'manager']), categoryController.createCategory);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update category
 * @access  Admin/Manager
 */
router.put('/:id', checkRole(['admin', 'manager']), categoryController.updateCategory);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete category
 * @access  Admin only
 */
router.delete('/:id', checkRole(['admin']), categoryController.deleteCategory);

module.exports = router;
