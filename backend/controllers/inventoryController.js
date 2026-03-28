/**
 * Inventory Controller - Request handlers for inventory items
 * Implements proper error handling with error codes and debug info
 * With detailed console logging for debugging
 */

const inventoryService = require('../services/inventoryService');

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
  const errorCode = error.errorCode || 'ITEM_500';
  
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
  
  res.status(statusCode).json(response);
};

/**
 * Get all items with pagination and filters
 */
exports.getAllItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', category, supplier, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    console.log('[CONTROLLER] getAllItems - Request query:', req.query);
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit) > 100 ? 100 : parseInt(limit),
      search,
      categoryId: category || null,
      supplierId: supplier || null,
      sortBy,
      sortOrder
    };

    console.log('[CONTROLLER] getAllItems - Options:', options);

    const result = await inventoryService.getAllItems(options);

    console.log('[CONTROLLER] getAllItems - Result success:', result.success);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res, 'getAllItems');
  }
};

/**
 * Get single item by ID
 */
exports.getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[CONTROLLER] getItemById - Item ID:', id);
    
    const result = await inventoryService.getItemById(id);

    console.log('[CONTROLLER] getItemById - Result success:', result.success);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res, 'getItemById');
  }
};

/**
 * Create new item (admin/manager only)
 */
exports.createItem = async (req, res, next) => {
  try {
    const itemData = req.body;
    const userRole = req.user?.role;

    console.log('[CONTROLLER] createItem - Request body:', itemData);
    console.log('[CONTROLLER] createItem - User role:', userRole);

    const result = await inventoryService.createItem(itemData, userRole);

    console.log('[CONTROLLER] createItem - Result success:', result.success);
    res.status(201).json(result);
  } catch (error) {
    handleServiceError(error, res, 'createItem');
  }
};

/**
 * Update item (admin/manager only)
 */
exports.updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const itemData = req.body;
    const userRole = req.user?.role;

    console.log('[CONTROLLER] updateItem - Item ID:', id);
    console.log('[CONTROLLER] updateItem - Request body:', itemData);
    console.log('[CONTROLLER] updateItem - User role:', userRole);

    const result = await inventoryService.updateItem(id, itemData, userRole);

    console.log('[CONTROLLER] updateItem - Result success:', result.success);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res, 'updateItem');
  }
};

/**
 * Delete item (admin only)
 */
exports.deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    console.log('[CONTROLLER] deleteItem - Item ID:', id);
    console.log('[CONTROLLER] deleteItem - User role:', userRole);

    const result = await inventoryService.deleteItem(id, userRole);

    console.log('[CONTROLLER] deleteItem - Result success:', result.success);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res, 'deleteItem');
  }
};

/**
 * Get low stock items
 */
exports.getLowStock = async (req, res, next) => {
  try {
    const { threshold = 10 } = req.query;
    console.log('[CONTROLLER] getLowStock - Threshold:', threshold);
    
    const result = await inventoryService.getLowStock(parseInt(threshold));

    console.log('[CONTROLLER] getLowStock - Result success:', result.success);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res, 'getLowStock');
  }
};

/**
 * Search items
 */
exports.searchItems = async (req, res, next) => {
  try {
    const { q } = req.query;
    console.log('[CONTROLLER] searchItems - Query:', q);
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
        errorCode: 'ITEM_001',
        timestamp: new Date().toISOString()
      });
    }

    const result = await inventoryService.searchItems(q);

    console.log('[CONTROLLER] searchItems - Result success:', result.success);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res, 'searchItems');
  }
};

/**
 * Get inventory stats (total, low stock, out of stock)
 */
exports.getStats = async (req, res, next) => {
  try {
    console.log('[CONTROLLER] getStats - Request');
    
    const result = await inventoryService.getStats();

    console.log('[CONTROLLER] getStats - Result success:', result.success);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res, 'getStats');
  }
};