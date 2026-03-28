/**
 * Supplier Routes - API routes for suppliers
 * With proper middleware for authentication and authorization
 * All CRUD operations with detailed console logging
 */

const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// All supplier routes require authentication
router.use(verifyToken);

console.log('[ROUTES] Supplier routes loaded');

/**
 * @route   GET /api/v1/suppliers/stats
 * @desc    Get supplier statistics
 * @access  Protected
 */
router.get('/stats', supplierController.getSupplierStats);

/**
 * @route   GET /api/v1/suppliers
 * @desc    Get all suppliers with optional filters
 * @access  Protected
 * @query   search, isActive, page, limit
 */
router.get('/', supplierController.getAllSuppliers);

/**
 * @route   GET /api/v1/suppliers/:id
 * @desc    Get supplier by ID
 * @access  Protected
 * @params  id
 */
router.get('/:id', supplierController.getSupplierById);

/**
 * @route   GET /api/v1/suppliers/:id/details
 * @desc    Get supplier with item count
 * @access  Protected
 * @params  id
 */
router.get('/:id/details', supplierController.getSupplierWithPurchaseStats);

/**
 * @route   POST /api/v1/suppliers
 * @desc    Create new supplier
 * @access  Admin/Manager
 * @body    name, contact_person, email, phone, address, notes
 */
router.post('/', checkRole(['admin', 'manager']), supplierController.createSupplier);

/**
 * @route   PUT /api/v1/suppliers/:id
 * @desc    Update supplier
 * @access  Admin/Manager
 * @params  id
 * @body    name, contact_person, email, phone, address, notes
 */
router.put('/:id', checkRole(['admin', 'manager']), supplierController.updateSupplier);

/**
 * @route   PATCH /api/v1/suppliers/:id/status
 * @desc    Toggle supplier active status
 * @access  Admin/Manager
 * @params  id
 */
router.patch('/:id/status', checkRole(['admin', 'manager']), supplierController.toggleSupplierStatus);

/**
 * @route   DELETE /api/v1/suppliers/:id
 * @desc    Delete supplier
 * @access  Admin only
 * @params  id
 */
router.delete('/:id', checkRole(['admin']), supplierController.deleteSupplier);

module.exports = router;
