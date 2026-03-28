/**
 * Supplier Controller - Request handlers for suppliers
 * With detailed console logging for debugging
 * Proper status codes for error identification
 */

const supplierService = require('../services/supplierService');

/**
 * Helper function to handle service errors
 */
const handleServiceError = (error, res, operation) => {
  console.error(`[CONTROLLER] Error in ${operation}:`, {
    message: error.message,
    errorCode: error.errorCode,
    statusCode: error.statusCode,
    stack: error.stack,
    debug: error.debug
  });
  
  const statusCode = error.statusCode || 500;
  const errorCode = error.errorCode || 'SUPPLIER_500';
  
  const response = {
    success: false,
    message: error.message || 'An error occurred',
    errorCode,
    timestamp: new Date().toISOString()
  };
  
  // Add debug info in development
  if (process.env.NODE_ENV === 'development' && error.debug) {
    response.debug = error.debug;
  }
  
  // Add validation errors if present
  if (error.debug?.errors) {
    response.errors = error.debug.errors;
  }
  
  console.log(`[CONTROLLER] ${operation} - Sending response:`, { statusCode, errorCode });
  res.status(statusCode).json(response);
};

/**
 * Get all suppliers with filters
 */
exports.getAllSuppliers = async (req, res, next) => {
  try {
    const { search = '', isActive = '', page = 1, limit = 10 } = req.query;
    
    console.log('[CONTROLLER] getAllSuppliers - Request query:', req.query);
    
    const options = {
      search,
      isActive: isActive === '' ? null : isActive === 'true',
      page: parseInt(page),
      limit: parseInt(limit)
    };

    console.log('[CONTROLLER] getAllSuppliers - Options:', options);
    const result = await supplierService.getAllSuppliers(options);

    console.log('[CONTROLLER] getAllSuppliers - Result success:', result.success, 'Count:', result.data?.length);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res, 'getAllSuppliers');
  }
};

/**
 * Get supplier stats
 */
exports.getSupplierStats = async (req, res, next) => {
  try {
    console.log('[CONTROLLER] getSupplierStats - Request');
    const result = await supplierService.getSupplierStats();
    console.log('[CONTROLLER] getSupplierStats - Result success:', result.success);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res, 'getSupplierStats');
  }
};

/**
 * Get supplier by ID
 */
exports.getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[CONTROLLER] getSupplierById - Supplier ID:', id);
    
    const result = await supplierService.getSupplierById(id);

    console.log('[CONTROLLER] getSupplierById - Result success:', result.success);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res, 'getSupplierById');
  }
};

/**
 * Create new supplier
 */
exports.createSupplier = async (req, res, next) => {
  try {
    const supplierData = req.body;
    const userRole = req.user?.role;

    console.log('[CONTROLLER] createSupplier - Request body:', supplierData);
    console.log('[CONTROLLER] createSupplier - User role:', userRole);

    const result = await supplierService.createSupplier(supplierData, userRole);

    console.log('[CONTROLLER] createSupplier - Result success:', result.success);
    res.status(201).json(result);
  } catch (error) {
    handleServiceError(error, res, 'createSupplier');
  }
};

/**
 * Update supplier
 */
exports.updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplierData = req.body;
    const userRole = req.user?.role;

    console.log('[CONTROLLER] updateSupplier - Supplier ID:', id);
    console.log('[CONTROLLER] updateSupplier - Request body:', supplierData);
    console.log('[CONTROLLER] updateSupplier - User role:', userRole);

    const result = await supplierService.updateSupplier(id, supplierData, userRole);

    console.log('[CONTROLLER] updateSupplier - Result success:', result.success);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res, 'updateSupplier');
  }
};

/**
 * Delete supplier
 */
exports.deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    console.log('[CONTROLLER] deleteSupplier - Supplier ID:', id);
    console.log('[CONTROLLER] deleteSupplier - User role:', userRole);

    const result = await supplierService.deleteSupplier(id, userRole);

    console.log('[CONTROLLER] deleteSupplier - Result success:', result.success);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res, 'deleteSupplier');
  }
};

/**
 * Get supplier with item count
 */
exports.getSupplierWithPurchaseStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[CONTROLLER] getSupplierWithPurchaseStats - Supplier ID:', id);
    
    const result = await supplierService.getSupplierWithPurchaseStats(id);

    console.log('[CONTROLLER] getSupplierWithPurchaseStats - Result success:', result.success);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res, 'getSupplierWithPurchaseStats');
  }
};

/**
 * Toggle supplier status (activate/deactivate)
 */
exports.toggleSupplierStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    console.log('[CONTROLLER] toggleSupplierStatus - Supplier ID:', id);
    console.log('[CONTROLLER] toggleSupplierStatus - User role:', userRole);

    const result = await supplierService.toggleSupplierStatus(id, userRole);

    console.log('[CONTROLLER] toggleSupplierStatus - Result success:', result.success);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res, 'toggleSupplierStatus');
  }
};
