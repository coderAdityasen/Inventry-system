/**
 * Supplier Service - Business logic for supplier management
 * Implements proper error handling with error codes and debug info
 * With detailed console logging for debugging
 */

const SupplierModel = require('../models/Supplier');
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
 * Get all suppliers with optional filters
 */
exports.getAllSuppliers = async (options = {}) => {
  console.log('[SERVICE] getAllSuppliers - Options:', options);
  try {
    const { search = '', isActive = null, page = 1, limit = 10 } = options;
    
    console.log('[SERVICE] getAllSuppliers - Calling model with:', { search, isActive, page, limit });
    const suppliers = await SupplierModel.findAll({ search, isActive, page, limit });
    console.log('[SERVICE] getAllSuppliers - Suppliers count:', suppliers.length);
    
    return {
      success: true,
      data: suppliers
    };
  } catch (error) {
    console.error('[SERVICE] getAllSuppliers - Error:', error);
    throw createError(
      'Failed to retrieve suppliers',
      'SUPPLIER_500',
      500,
      { service: 'getAllSuppliers', originalError: error.message }
    );
  }
};

/**
 * Get single supplier by ID
 */
exports.getSupplierById = async (id) => {
  console.log('[SERVICE] getSupplierById - Supplier ID:', id);
  try {
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      console.log('[SERVICE] getSupplierById - Invalid ID provided');
      throw createError(
        'Invalid supplier ID',
        'SUPPLIER_001',
        400,
        { providedId: id }
      );
    }

    const supplier = await SupplierModel.findById(id);
    
    if (!supplier) {
      console.log('[SERVICE] getSupplierById - Supplier not found:', id);
      throw createError(
        `Supplier not found with ID: ${id}`,
        'SUPPLIER_004',
        404,
        { requestedId: id }
      );
    }

    console.log('[SERVICE] getSupplierById - Found supplier:', supplier.name);
    return {
      success: true,
      data: supplier
    };
  } catch (error) {
    // Re-throw known errors
    if (error.errorCode) {
      console.error('[SERVICE] getSupplierById - Known error:', error.errorCode, error.message);
      throw error;
    }
    console.error('[SERVICE] getSupplierById - Error:', error);
    throw createError(
      'Failed to retrieve supplier',
      'SUPPLIER_500',
      500,
      { service: 'getSupplierById', supplierId: id, originalError: error.message }
    );
  }
};

/**
 * Create new supplier
 */
exports.createSupplier = async (supplierData, userRole) => {
  console.log('[SERVICE] createSupplier - Supplier data:', supplierData);
  console.log('[SERVICE] createSupplier - User role:', userRole);
  try {
    // Validate required fields
    const errors = [];
    
    if (!supplierData.name || supplierData.name.trim() === '') {
      errors.push({ field: 'name', message: 'Supplier name is required' });
    }

    if (!supplierData.email || supplierData.email.trim() === '') {
      errors.push({ field: 'email', message: 'Email is required' });
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(supplierData.email)) {
        errors.push({ field: 'email', message: 'Invalid email format' });
      }
    }

    if (!supplierData.phone || supplierData.phone.trim() === '') {
      errors.push({ field: 'phone', message: 'Phone number is required' });
    } else {
      // Validate phone format (basic validation)
      const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
      if (!phoneRegex.test(supplierData.phone)) {
        errors.push({ field: 'phone', message: 'Invalid phone format' });
      }
    }

    // Check authorization - Admin/Manager only
    if (!userRole || !['admin', 'manager'].includes(userRole)) {
      console.log('[SERVICE] createSupplier - Insufficient permissions:', userRole);
      throw createError(
        'Insufficient permissions to create supplier',
        'SUPPLIER_007',
        403,
        { userRole, requiredRole: 'admin or manager' }
      );
    }

    // If there are validation errors, throw them
    if (errors.length > 0) {
      console.log('[SERVICE] createSupplier - Validation errors:', errors);
      throw createError(
        'Validation failed',
        'SUPPLIER_001',
        400,
        { errors }
      );
    }

    // Check if email already exists
    console.log('[SERVICE] createSupplier - Checking if email exists:', supplierData.email);
    const existingSupplier = await SupplierModel.findByEmail(supplierData.email);
    console.log('[SERVICE] createSupplier - Existing supplier:', existingSupplier);
    if (existingSupplier) {
      console.log('[SERVICE] createSupplier - Email already exists:', supplierData.email);
      throw createError(
        `Email already exists: ${supplierData.email}`,
        'SUPPLIER_002',
        400,
        { field: 'email', providedEmail: supplierData.email }
      );
    }

    // Create supplier
    const supplierId = await SupplierModel.create(supplierData);
    console.log('[SERVICE] createSupplier - Created supplier ID:', supplierId);

    return {
      success: true,
      message: 'Supplier created successfully',
      data: { id: supplierId }
    };
  } catch (error) {
    // Re-throw known errors
    if (error.errorCode) {
      console.error('[SERVICE] createSupplier - Known error:', error.errorCode, error.message);
      throw error;
    }
    console.error('[SERVICE] createSupplier - Error:', error);
    throw createError(
      'Failed to create supplier',
      'SUPPLIER_500',
      500,
      { service: 'createSupplier', originalError: error.message }
    );
  }
};

/**
 * Update supplier
 */
exports.updateSupplier = async (id, supplierData, userRole) => {
  console.log('[SERVICE] updateSupplier - Supplier ID:', id);
  console.log('[SERVICE] updateSupplier - Supplier data:', supplierData);
  console.log('[SERVICE] updateSupplier - User role:', userRole);
  try {
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      console.log('[SERVICE] updateSupplier - Invalid ID provided');
      throw createError(
        'Invalid supplier ID',
        'SUPPLIER_001',
        400,
        { providedId: id }
      );
    }

    // Check authorization - Admin/Manager only
    if (!userRole || !['admin', 'manager'].includes(userRole)) {
      console.log('[SERVICE] updateSupplier - Insufficient permissions:', userRole);
      throw createError(
        'Insufficient permissions to update supplier',
        'SUPPLIER_007',
        403,
        { userRole, requiredRole: 'admin or manager' }
      );
    }

    // Check if supplier exists
    const existingSupplier = await SupplierModel.findById(id);
    if (!existingSupplier) {
      console.log('[SERVICE] updateSupplier - Supplier not found:', id);
      throw createError(
        `Supplier not found with ID: ${id}`,
        'SUPPLIER_004',
        404,
        { requestedId: id }
      );
    }

    // Validate email if provided
    if (supplierData.email && supplierData.email !== existingSupplier.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(supplierData.email)) {
        throw createError(
          'Invalid email format',
          'SUPPLIER_001',
          400,
          { field: 'email' }
        );
      }

      // Check if new email already exists
      const emailExists = await SupplierModel.findByEmail(supplierData.email);
      if (emailExists) {
        throw createError(
          `Email already exists: ${supplierData.email}`,
          'SUPPLIER_002',
          400,
          { field: 'email', providedEmail: supplierData.email }
        );
      }
    }

    // Validate phone if provided
    if (supplierData.phone) {
      const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
      if (!phoneRegex.test(supplierData.phone)) {
        throw createError(
          'Invalid phone format',
          'SUPPLIER_001',
          400,
          { field: 'phone' }
        );
      }
    }

    // Validate name if provided
    if (supplierData.name && supplierData.name.trim() === '') {
      throw createError(
        'Supplier name cannot be empty',
        'SUPPLIER_001',
        400,
        { field: 'name' }
      );
    }

    // Update supplier
    await SupplierModel.update(id, supplierData);
    console.log('[SERVICE] updateSupplier - Updated supplier ID:', id);

    return {
      success: true,
      message: 'Supplier updated successfully',
      data: { id, updated_at: new Date().toISOString() }
    };
  } catch (error) {
    // Re-throw known errors
    if (error.errorCode) {
      console.error('[SERVICE] updateSupplier - Known error:', error.errorCode, error.message);
      throw error;
    }
    console.error('[SERVICE] updateSupplier - Error:', error);
    throw createError(
      'Failed to update supplier',
      'SUPPLIER_500',
      500,
      { service: 'updateSupplier', supplierId: id, originalError: error.message }
    );
  }
};

/**
 * Delete supplier (soft delete or hard delete)
 */
exports.deleteSupplier = async (id, userRole) => {
  console.log('[SERVICE] deleteSupplier - Supplier ID:', id);
  console.log('[SERVICE] deleteSupplier - User role:', userRole);
  try {
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      console.log('[SERVICE] deleteSupplier - Invalid ID provided');
      throw createError(
        'Invalid supplier ID',
        'SUPPLIER_001',
        400,
        { providedId: id }
      );
    }

    // Check authorization - Admin only
    if (userRole !== 'admin') {
      console.log('[SERVICE] deleteSupplier - Insufficient permissions:', userRole);
      throw createError(
        'Only administrators can delete suppliers',
        'SUPPLIER_007',
        403,
        { userRole, requiredRole: 'admin' }
      );
    }

    // Check if supplier exists
    const existingSupplier = await SupplierModel.findById(id);
    if (!existingSupplier) {
      console.log('[SERVICE] deleteSupplier - Supplier not found:', id);
      throw createError(
        `Supplier not found with ID: ${id}`,
        'SUPPLIER_004',
        404,
        { requestedId: id }
      );
    }

    // Check if supplier is linked to any items
    const itemCount = await InventoryItemModel.countBySupplier(id);
    if (itemCount > 0) {
      console.log('[SERVICE] deleteSupplier - Supplier has linked items:', itemCount);
      throw createError(
        'Cannot delete supplier with linked items. Please remove or reassign items first.',
        'SUPPLIER_010',
        409,
        { 
          linkedItems: itemCount,
          suggestion: 'Set supplier as inactive instead of deleting'
        }
      );
    }

    // Delete supplier
    await SupplierModel.delete(id);
    console.log('[SERVICE] deleteSupplier - Deleted supplier ID:', id);

    return {
      success: true,
      message: 'Supplier deleted successfully'
    };
  } catch (error) {
    // Re-throw known errors
    if (error.errorCode) {
      console.error('[SERVICE] deleteSupplier - Known error:', error.errorCode, error.message);
      throw error;
    }
    console.error('[SERVICE] deleteSupplier - Error:', error);
    throw createError(
      'Failed to delete supplier',
      'SUPPLIER_500',
      500,
      { service: 'deleteSupplier', supplierId: id, originalError: error.message }
    );
  }
};

/**
 * Get supplier with item count
 */
exports.getSupplierWithItemCount = async (id) => {
  console.log('[SERVICE] getSupplierWithItemCount - Supplier ID:', id);
  try {
    const supplier = await SupplierModel.findById(id);
    
    if (!supplier) {
      throw createError(
        `Supplier not found with ID: ${id}`,
        'SUPPLIER_004',
        404,
        { requestedId: id }
      );
    }

    const itemCount = await InventoryItemModel.countBySupplier(id);
    
    console.log('[SERVICE] getSupplierWithItemCount - Item count:', itemCount);
    
    return {
      success: true,
      data: {
        ...supplier,
        itemCount
      }
    };
  } catch (error) {
    if (error.errorCode) {
      throw error;
    }
    console.error('[SERVICE] getSupplierWithItemCount - Error:', error);
    throw createError(
      'Failed to retrieve supplier details',
      'SUPPLIER_500',
      500,
      { service: 'getSupplierWithItemCount', supplierId: id, originalError: error.message }
    );
  }
};

/**
 * Toggle supplier active status
 */
exports.toggleSupplierStatus = async (id, userRole) => {
  console.log('[SERVICE] toggleSupplierStatus - Supplier ID:', id);
  console.log('[SERVICE] toggleSupplierStatus - User role:', userRole);
  try {
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      throw createError(
        'Invalid supplier ID',
        'SUPPLIER_001',
        400,
        { providedId: id }
      );
    }

    // Check authorization - Admin/Manager only
    if (!userRole || !['admin', 'manager'].includes(userRole)) {
      throw createError(
        'Insufficient permissions to update supplier status',
        'SUPPLIER_007',
        403,
        { userRole, requiredRole: 'admin or manager' }
      );
    }

    // Check if supplier exists
    const existingSupplier = await SupplierModel.findById(id);
    if (!existingSupplier) {
      throw createError(
        `Supplier not found with ID: ${id}`,
        'SUPPLIER_004',
        404,
        { requestedId: id }
      );
    }

    // Toggle status
    const newStatus = !existingSupplier.is_active;
    await SupplierModel.updateStatus(id, newStatus);
    
    console.log('[SERVICE] toggleSupplierStatus - New status:', newStatus);

    return {
      success: true,
      message: newStatus ? 'Supplier activated successfully' : 'Supplier deactivated successfully',
      data: { id, isActive: newStatus }
    };
  } catch (error) {
    if (error.errorCode) {
      throw error;
    }
    console.error('[SERVICE] toggleSupplierStatus - Error:', error);
    throw createError(
      'Failed to update supplier status',
      'SUPPLIER_500',
      500,
      { service: 'toggleSupplierStatus', supplierId: id, originalError: error.message }
    );
  }
};
