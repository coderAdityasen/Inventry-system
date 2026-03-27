/**
 * Supplier Controller - Request handlers for suppliers
 * With detailed console logging for debugging
 */

const SupplierModel = require('../models/Supplier');

/**
 * Helper function to handle errors
 */
const handleError = (error, res, operation) => {
  console.error(`[CONTROLLER] Error in ${operation}:`, {
    message: error.message,
    stack: error.stack
  });
  
  const statusCode = error.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: error.message || 'An error occurred',
    timestamp: new Date().toISOString()
  });
};

/**
 * Get all suppliers
 */
exports.getAllSuppliers = async (req, res, next) => {
  console.log('[CONTROLLER] getAllSuppliers - Request');
  try {
    const suppliers = await SupplierModel.findAll();
    console.log('[CONTROLLER] getAllSuppliers - Suppliers count:', suppliers.length);
    res.status(200).json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    handleError(error, res, 'getAllSuppliers');
  }
};

/**
 * Get supplier by ID
 */
exports.getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[CONTROLLER] getSupplierById - Supplier ID:', id);
    
    const supplier = await SupplierModel.findById(id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    console.log('[CONTROLLER] getSupplierById - Found:', supplier.id);
    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    handleError(error, res, 'getSupplierById');
  }
};

/**
 * Create new supplier
 */
exports.createSupplier = async (req, res, next) => {
  try {
    const supplierData = req.body;
    console.log('[CONTROLLER] createSupplier - Request body:', supplierData);

    if (!supplierData.name || supplierData.name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Supplier name is required'
      });
    }

    const supplierId = await SupplierModel.create(supplierData);
    console.log('[CONTROLLER] createSupplier - Created ID:', supplierId);

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: { id: supplierId }
    });
  } catch (error) {
    handleError(error, res, 'createSupplier');
  }
};

/**
 * Update supplier
 */
exports.updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplierData = req.body;
    console.log('[CONTROLLER] updateSupplier - Supplier ID:', id, 'Data:', supplierData);

    const existing = await SupplierModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    if (!supplierData.name || supplierData.name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Supplier name is required'
      });
    }

    await SupplierModel.update(id, supplierData);
    console.log('[CONTROLLER] updateSupplier - Updated ID:', id);

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully'
    });
  } catch (error) {
    handleError(error, res, 'updateSupplier');
  }
};

/**
 * Delete supplier
 */
exports.deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[CONTROLLER] deleteSupplier - Supplier ID:', id);

    const existing = await SupplierModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    await SupplierModel.delete(id);
    console.log('[CONTROLLER] deleteSupplier - Deleted ID:', id);

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    handleError(error, res, 'deleteSupplier');
  }
};
