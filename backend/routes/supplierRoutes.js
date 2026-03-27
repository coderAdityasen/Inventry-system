/**
 * Supplier Routes - API routes for suppliers
 * With proper middleware for authentication and authorization
 */

const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// All supplier routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/v1/suppliers
 * @desc    Get all suppliers
 * @access  Protected
 */
router.get('/', supplierController.getAllSuppliers);

/**
 * @route   GET /api/v1/suppliers/:id
 * @desc    Get supplier by ID
 * @access  Protected
 */
router.get('/:id', supplierController.getSupplierById);

/**
 * @route   POST /api/v1/suppliers
 * @desc    Create new supplier
 * @access  Admin/Manager
 */
router.post('/', checkRole(['admin', 'manager']), supplierController.createSupplier);

/**
 * @route   PUT /api/v1/suppliers/:id
 * @desc    Update supplier
 * @access  Admin/Manager
 */
router.put('/:id', checkRole(['admin', 'manager']), supplierController.updateSupplier);

/**
 * @route   DELETE /api/v1/suppliers/:id
 * @desc    Delete supplier
 * @access  Admin only
 */
router.delete('/:id', checkRole(['admin']), supplierController.deleteSupplier);

module.exports = router;
