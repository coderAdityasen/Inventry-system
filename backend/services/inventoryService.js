/**
 * Inventory Service - Business logic for inventory items
 * Implements proper error handling with error codes and debug info
 * With detailed console logging for debugging
 */

const InventoryItemModel = require('../models/InventoryItem');

/**
 * Error factory function for consistent error handling
 */
const createError = (message, errorCode, statusCode, debug = {}) => {
  const error = new Error(message);
  error.errorCode = errorCode;
  error.statusCode = statusCode;
  error.debug = debug;
  return error;
};

/**
 * Helper to convert undefined to null for database operations
 */
const sanitizeItemData = (itemData, includeAllFields = false) => {
  const sanitized = {};
  const fields = ['name', 'sku', 'description', 'quantity', 'price', 'category_id', 'supplier_id', 'low_stock_threshold', 'image_url'];
  
  fields.forEach(field => {
    if (itemData[field] !== undefined) {
      sanitized[field] = itemData[field] === '' ? null : itemData[field];
    } else if (includeAllFields) {
      // For update operations, include all fields with null if not provided
      sanitized[field] = null;
    }
  });
  
  return sanitized;
};

/**
 * Get all items with pagination and filters
 */
exports.getAllItems = async (options) => {
  console.log('[SERVICE] getAllItems - Options:', options);
  try {
    const result = await InventoryItemModel.findAll(options);
    console.log('[SERVICE] getAllItems - Items count:', result.items?.length);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('[SERVICE] getAllItems - Error:', error);
    throw createError(
      'Failed to retrieve items',
      'ITEM_500',
      500,
      { service: 'getAllItems', originalError: error.message }
    );
  }
};

/**
 * Get single item by ID
 */
exports.getItemById = async (id) => {
  console.log('[SERVICE] getItemById - Item ID:', id);
  try {
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      throw createError(
        'Invalid item ID',
        'ITEM_001',
        400,
        { providedId: id }
      );
    }

    const item = await InventoryItemModel.findById(id);
    
    if (!item) {
      throw createError(
        `Item not found with ID: ${id}`,
        'ITEM_004',
        404,
        { requestedId: id, databaseQuery: 'SELECT * FROM inventory_items WHERE id = ?' }
      );
    }

    console.log('[SERVICE] getItemById - Item found:', item.id);
    return {
      success: true,
      data: item
    };
  } catch (error) {
    // Re-throw known errors
    if (error.errorCode) {
      console.error('[SERVICE] getItemById - Known error:', error.errorCode, error.message);
      throw error;
    }
    console.error('[SERVICE] getItemById - Error:', error);
    throw createError(
      'Failed to retrieve item',
      'ITEM_500',
      500,
      { service: 'getItemById', itemId: id, originalError: error.message }
    );
  }
};

/**
 * Create new item
 */
exports.createItem = async (itemData, userRole) => {
  console.log('[SERVICE] createItem - Item data:', itemData);
  console.log('[SERVICE] createItem - User role:', userRole);
  try {
    const errors = [];

    // Validate required fields
    if (!itemData.name || itemData.name.trim() === '') {
      errors.push({ field: 'name', message: 'Item name is required' });
    }

    if (!itemData.sku || itemData.sku.trim() === '') {
      errors.push({ field: 'sku', message: 'SKU is required' });
    }

    // Check authorization for admin/manager only
    if (!userRole || !['admin', 'manager'].includes(userRole)) {
      throw createError(
        'Insufficient permissions to create item',
        'ITEM_007',
        403,
        { userRole, requiredRole: 'admin or manager' }
      );
    }

    // Validate quantity
    if (itemData.quantity !== undefined && itemData.quantity < 0) {
      errors.push({ field: 'quantity', message: 'Quantity cannot be negative' });
    }

    // Validate price
    if (itemData.price !== undefined && itemData.price < 0) {
      errors.push({ field: 'price', message: 'Price cannot be negative' });
    }

    // If there are validation errors, throw them
    if (errors.length > 0) {
      throw createError(
        'Validation failed',
        'ITEM_001',
        400,
        { errors }
      );
    }

    // Check if SKU already exists
    const existingSku = await InventoryItemModel.findBySku(itemData.sku);
    if (existingSku) {
      throw createError(
        `SKU already exists: ${itemData.sku}`,
        'ITEM_002',
        400,
        { field: 'sku', providedSku: itemData.sku }
      );
    }

    // Validate category exists
    if (itemData.category_id) {
      const categoryExists = await InventoryItemModel.categoryExists(itemData.category_id);
      if (!categoryExists) {
        throw createError(
          `Category not found with ID: ${itemData.category_id}`,
          'ITEM_005',
          400,
          { requestedCategoryId: itemData.category_id }
        );
      }
    }

    // Validate supplier exists
    if (itemData.supplier_id) {
      const supplierExists = await InventoryItemModel.supplierExists(itemData.supplier_id);
      if (!supplierExists) {
        throw createError(
          `Supplier not found with ID: ${itemData.supplier_id}`,
          'ITEM_006',
          400,
          { requestedSupplierId: itemData.supplier_id }
        );
      }
    }

    // Sanitize item data to convert undefined to null
    const sanitizedData = sanitizeItemData(itemData);
    console.log('[SERVICE] createItem - Sanitized data:', sanitizedData);

    // Create item
    const itemId = await InventoryItemModel.create(sanitizedData);
    console.log('[SERVICE] createItem - Created item ID:', itemId);
    
    return {
      success: true,
      message: 'Item created successfully',
      data: { id: itemId }
    };
  } catch (error) {
    // Re-throw known errors
    if (error.errorCode) {
      console.error('[SERVICE] createItem - Known error:', error.errorCode, error.message);
      throw error;
    }
    console.error('[SERVICE] createItem - Error:', error);
    throw createError(
      'Failed to create item',
      'ITEM_500',
      500,
      { service: 'createItem', originalError: error.message }
    );
  }
};

/**
 * Update item
 */
exports.updateItem = async (id, itemData, userRole) => {
  console.log('[SERVICE] updateItem - Item ID:', id);
  console.log('[SERVICE] updateItem - Item data:', itemData);
  console.log('[SERVICE] updateItem - User role:', userRole);
  try {
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      throw createError(
        'Invalid item ID',
        'ITEM_001',
        400,
        { providedId: id }
      );
    }

    // Check authorization for admin/manager only
    if (!userRole || !['admin', 'manager'].includes(userRole)) {
      throw createError(
        'Insufficient permissions to update item',
        'ITEM_007',
        403,
        { userRole, requiredRole: 'admin or manager' }
      );
    }

    // Check if item exists
    const existingItem = await InventoryItemModel.findById(id);
    if (!existingItem) {
      throw createError(
        `Item not found with ID: ${id}`,
        'ITEM_004',
        404,
        { requestedId: id }
      );
    }

    // Validate quantity
    if (itemData.quantity !== undefined && itemData.quantity < 0) {
      throw createError(
        'Quantity cannot be negative',
        'ITEM_003',
        400,
        { field: 'quantity', providedValue: itemData.quantity }
      );
    }

    // Validate price
    if (itemData.price !== undefined && itemData.price < 0) {
      throw createError(
        'Price cannot be negative',
        'ITEM_008',
        400,
        { field: 'price', providedValue: itemData.price }
      );
    }

    // Check if SKU is being changed and if it already exists
    if (itemData.sku && itemData.sku !== existingItem.sku) {
      const existingSku = await InventoryItemModel.findBySku(itemData.sku, id);
      if (existingSku) {
        throw createError(
          `SKU already exists: ${itemData.sku}`,
          'ITEM_002',
          400,
          { field: 'sku', providedSku: itemData.sku }
        );
      }
    }

    // Validate category exists
    if (itemData.category_id) {
      const categoryExists = await InventoryItemModel.categoryExists(itemData.category_id);
      if (!categoryExists) {
        throw createError(
          `Category not found with ID: ${itemData.category_id}`,
          'ITEM_005',
          400,
          { requestedCategoryId: itemData.category_id }
        );
      }
    }

    // Validate supplier exists
    if (itemData.supplier_id) {
      const supplierExists = await InventoryItemModel.supplierExists(itemData.supplier_id);
      if (!supplierExists) {
        throw createError(
          `Supplier not found with ID: ${itemData.supplier_id}`,
          'ITEM_006',
          400,
          { requestedSupplierId: itemData.supplier_id }
        );
      }
    }

    // Sanitize item data to convert undefined to null
    const sanitizedData = sanitizeItemData(itemData, true);
    console.log('[SERVICE] updateItem - Sanitized data:', sanitizedData);

    // Update item
    await InventoryItemModel.update(id, sanitizedData);
    console.log('[SERVICE] updateItem - Updated item ID:', id);

    return {
      success: true,
      message: 'Item updated successfully',
      data: { id, updated_at: new Date().toISOString() }
    };
  } catch (error) {
    // Re-throw known errors
    if (error.errorCode) {
      console.error('[SERVICE] updateItem - Known error:', error.errorCode, error.message);
      throw error;
    }
    console.error('[SERVICE] updateItem - Error:', error);
    throw createError(
      'Failed to update item',
      'ITEM_500',
      500,
      { service: 'updateItem', itemId: id, originalError: error.message }
    );
  }
};

/**
 * Delete item (admin only)
 */
exports.deleteItem = async (id, userRole) => {
  console.log('[SERVICE] deleteItem - Item ID:', id);
  console.log('[SERVICE] deleteItem - User role:', userRole);
  try {
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      throw createError(
        'Invalid item ID',
        'ITEM_001',
        400,
        { providedId: id }
      );
    }

    // Check authorization - admin only
    if (userRole !== 'admin') {
      throw createError(
        'Only administrators can delete items',
        'ITEM_007',
        403,
        { userRole, requiredRole: 'admin' }
      );
    }

    // Check if item exists
    const existingItem = await InventoryItemModel.findById(id);
    if (!existingItem) {
      throw createError(
        `Item not found with ID: ${id}`,
        'ITEM_004',
        404,
        { requestedId: id }
      );
    }

    // Check if item has stock
    if (existingItem.quantity > 0) {
      throw createError(
        'Cannot delete item with remaining stock',
        'ITEM_010',
        409,
        { 
          currentStock: existingItem.quantity,
          suggestion: 'Reduce stock to zero before deletion'
        }
      );
    }

    // Delete item
    await InventoryItemModel.delete(id);
    console.log('[SERVICE] deleteItem - Deleted item ID:', id);

    return {
      success: true,
      message: 'Item deleted successfully'
    };
  } catch (error) {
    // Re-throw known errors
    if (error.errorCode) {
      console.error('[SERVICE] deleteItem - Known error:', error.errorCode, error.message);
      throw error;
    }
    console.error('[SERVICE] deleteItem - Error:', error);
    throw createError(
      'Failed to delete item',
      'ITEM_500',
      500,
      { service: 'deleteItem', itemId: id, originalError: error.message }
    );
  }
};

/**
 * Get low stock items
 */
exports.getLowStock = async (threshold = 10) => {
  console.log('[SERVICE] getLowStock - Threshold:', threshold);
  try {
    // Validate threshold
    if (threshold < 0) {
      throw createError(
        'Threshold must be a positive number',
        'ITEM_001',
        400,
        { field: 'threshold', providedValue: threshold }
      );
    }

    const items = await InventoryItemModel.getLowStock(threshold);
    
    const criticalItems = items.filter(item => item.quantity === 0);

    console.log('[SERVICE] getLowStock - Items count:', items.length);
    return {
      success: true,
      data: {
        items,
        totalLowStockItems: items.length,
        criticalItems: criticalItems.length
      }
    };
  } catch (error) {
    // Re-throw known errors
    if (error.errorCode) {
      console.error('[SERVICE] getLowStock - Known error:', error.errorCode, error.message);
      throw error;
    }
    console.error('[SERVICE] getLowStock - Error:', error);
    throw createError(
      'Failed to retrieve low stock items',
      'ITEM_500',
      500,
      { service: 'getLowStock', originalError: error.message }
    );
  }
};

/**
 * Search items (alternative endpoint)
 */
exports.searchItems = async (searchTerm) => {
  console.log('[SERVICE] searchItems - Search term:', searchTerm);
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      throw createError(
        'Search term is required',
        'ITEM_001',
        400,
        { field: 'search' }
      );
    }

    const result = await InventoryItemModel.findAll({
      search: searchTerm.trim(),
      page: 1,
      limit: 20
    });

    console.log('[SERVICE] searchItems - Items count:', result.items?.length);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    // Re-throw known errors
    if (error.errorCode) {
      console.error('[SERVICE] searchItems - Known error:', error.errorCode, error.message);
      throw error;
    }
    console.error('[SERVICE] searchItems - Error:', error);
    throw createError(
      'Failed to search items',
      'ITEM_500',
      500,
      { service: 'searchItems', searchTerm, originalError: error.message }
    );
  }
};