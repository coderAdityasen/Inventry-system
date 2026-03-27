/**
 * Order Service - Business logic for order management
 * Implements proper error handling with error codes and debug info
 * With detailed console logging for debugging
 */

const OrderModel = require('../models/Order');
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
 * Get all orders with optional filters
 */
exports.getAllOrders = async (options = {}) => {
  console.log('[SERVICE] getAllOrders - Options:', options);
  try {
    const { search = '', status = null, orderType = null, page = 1, limit = 10 } = options;
    
    console.log('[SERVICE] getAllOrders - Calling model with:', { search, status, orderType, page, limit });
    const orders = await OrderModel.findAll({ search, status, orderType, page, limit });
    console.log('[SERVICE] getAllOrders - Orders count:', orders.length);
    
    return {
      success: true,
      data: orders
    };
  } catch (error) {
    console.error('[SERVICE] getAllOrders - Error:', error);
    throw createError(
      'Failed to retrieve orders',
      'ORDER_500',
      500,
      { service: 'getAllOrders', originalError: error.message }
    );
  }
};

/**
 * Get single order by ID
 */
exports.getOrderById = async (id) => {
  console.log('[SERVICE] getOrderById - Order ID:', id);
  try {
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      console.log('[SERVICE] getOrderById - Invalid ID provided');
      throw createError(
        'Invalid order ID',
        'ORDER_001',
        400,
        { providedId: id }
      );
    }

    const order = await OrderModel.findByIdWithItems(id);
    
    if (!order) {
      console.log('[SERVICE] getOrderById - Order not found:', id);
      throw createError(
        `Order not found with ID: ${id}`,
        'ORDER_004',
        404,
        { requestedId: id }
      );
    }

    console.log('[SERVICE] getOrderById - Found order:', order.order_number);
    return {
      success: true,
      data: order
    };
  } catch (error) {
    // Re-throw known errors
    if (error.errorCode) {
      console.error('[SERVICE] getOrderById - Known error:', error.errorCode, error.message);
      throw error;
    }
    console.error('[SERVICE] getOrderById - Error:', error);
    throw createError(
      'Failed to retrieve order',
      'ORDER_500',
      500,
      { service: 'getOrderById', orderId: id, originalError: error.message }
    );
  }
};

/**
 * Create new order
 */
exports.createOrder = async (orderData, userId, userRole) => {
  console.log('[SERVICE] createOrder - Order data:', orderData);
  console.log('[SERVICE] createOrder - User ID:', userId, 'Role:', userRole);
  try {
    // Validate required fields
    const errors = [];
    
    if (!orderData.order_type || !['purchase', 'sale'].includes(orderData.order_type)) {
      errors.push({ field: 'order_type', message: 'Order type is required (purchase or sale)' });
    }

    // For purchase orders, supplier is required
    if (orderData.order_type === 'purchase' && !orderData.supplier_id) {
      errors.push({ field: 'supplier_id', message: 'Supplier is required for purchase orders' });
    }

    // Validate order items
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      errors.push({ field: 'items', message: 'At least one item is required' });
    }

    // Check authorization - Admin/Manager only
    if (!userRole || !['admin', 'manager'].includes(userRole)) {
      console.log('[SERVICE] createOrder - Insufficient permissions:', userRole);
      throw createError(
        'Insufficient permissions to create order',
        'ORDER_007',
        403,
        { userRole, requiredRole: 'admin or manager' }
      );
    }

    // If there are validation errors, throw them
    if (errors.length > 0) {
      console.log('[SERVICE] createOrder - Validation errors:', errors);
      throw createError(
        'Validation failed',
        'ORDER_001',
        400,
        { errors }
      );
    }

    // Generate order number
    const orderNumber = await OrderModel.generateOrderNumber(orderData.order_type);
    console.log('[SERVICE] createOrder - Generated order number:', orderNumber);

    // Calculate total amount
    let totalAmount = 0;
    for (const item of orderData.items) {
      totalAmount += (item.quantity * item.unit_price);
    }
    console.log('[SERVICE] createOrder - Total amount:', totalAmount);

    // Create order
    const orderId = await OrderModel.create({
      order_number: orderNumber,
      order_type: orderData.order_type,
      supplier_id: orderData.supplier_id,
      status: 'pending',
      notes: orderData.notes,
      total_amount: totalAmount,
      created_by: userId
    });
    console.log('[SERVICE] createOrder - Created order ID:', orderId);

    // Add order items
    for (const item of orderData.items) {
      const itemTotal = item.quantity * item.unit_price;
      await OrderModel.addItem(orderId, {
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: itemTotal
      });
      console.log('[SERVICE] createOrder - Added item:', item.item_id, 'qty:', item.quantity);
    }

    return {
      success: true,
      message: 'Order created successfully',
      data: { id: orderId, order_number: orderNumber }
    };
  } catch (error) {
    // Re-throw known errors
    if (error.errorCode) {
      console.error('[SERVICE] createOrder - Known error:', error.errorCode, error.message);
      throw error;
    }
    console.error('[SERVICE] createOrder - Error:', error);
    throw createError(
      'Failed to create order',
      'ORDER_500',
      500,
      { service: 'createOrder', originalError: error.message }
    );
  }
};

/**
 * Update order
 */
exports.updateOrder = async (id, orderData, userRole) => {
  console.log('[SERVICE] updateOrder - Order ID:', id, 'Data:', orderData);
  console.log('[SERVICE] updateOrder - User role:', userRole);
  try {
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      throw createError(
        'Invalid order ID',
        'ORDER_001',
        400,
        { providedId: id }
      );
    }

    // Check authorization - Admin/Manager only
    if (!userRole || !['admin', 'manager'].includes(userRole)) {
      throw createError(
        'Insufficient permissions to update order',
        'ORDER_007',
        403,
        { userRole, requiredRole: 'admin or manager' }
      );
    }

    // Check if order exists
    const existingOrder = await OrderModel.findById(id);
    if (!existingOrder) {
      throw createError(
        `Order not found with ID: ${id}`,
        'ORDER_004',
        404,
        { requestedId: id }
      );
    }

    // Cannot update completed orders
    if (existingOrder.status === 'completed') {
      throw createError(
        'Cannot update completed order',
        'ORDER_008',
        400,
        { orderId: id, status: existingOrder.status }
      );
    }

    await OrderModel.update(id, orderData);
    console.log('[SERVICE] updateOrder - Order updated successfully');

    return {
      success: true,
      message: 'Order updated successfully'
    };
  } catch (error) {
    if (error.errorCode) {
      console.error('[SERVICE] updateOrder - Known error:', error.errorCode, error.message);
      throw error;
    }
    console.error('[SERVICE] updateOrder - Error:', error);
    throw createError(
      'Failed to update order',
      'ORDER_500',
      500,
      { service: 'updateOrder', orderId: id, originalError: error.message }
    );
  }
};

/**
 * Update order status
 */
exports.updateOrderStatus = async (id, newStatus, userRole) => {
  console.log('[SERVICE] updateOrderStatus - Order ID:', id, 'New status:', newStatus);
  console.log('[SERVICE] updateOrderStatus - User role:', userRole);
  try {
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      throw createError(
        'Invalid order ID',
        'ORDER_001',
        400,
        { providedId: id }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw createError(
        'Invalid status value',
        'ORDER_001',
        400,
        { providedStatus: newStatus }
      );
    }

    // Check authorization - Admin/Manager only
    if (!userRole || !['admin', 'manager'].includes(userRole)) {
      throw createError(
        'Insufficient permissions to update order status',
        'ORDER_007',
        403,
        { userRole, requiredRole: 'admin or manager' }
      );
    }

    // Check if order exists
    const existingOrder = await OrderModel.findById(id);
    if (!existingOrder) {
      throw createError(
        `Order not found with ID: ${id}`,
        'ORDER_004',
        404,
        { requestedId: id }
      );
    }

    // Update status
    await OrderModel.updateStatus(id, newStatus);
    console.log('[SERVICE] updateOrderStatus - Status updated to:', newStatus);

    // If order is completed, update inventory
    if (newStatus === 'completed') {
      console.log('[SERVICE] updateOrderStatus - Processing inventory update for order:', id);
      
      const order = await OrderModel.findByIdWithItems(id);
      const items = order.items || [];
      
      for (const orderItem of items) {
        const quantityChange = orderData.order_type === 'purchase' 
          ? orderItem.quantity 
          : -orderItem.quantity;
        
        // Update inventory
        await InventoryItemModel.updateQuantity(orderItem.item_id, quantityChange);
        console.log('[SERVICE] updateOrderStatus - Updated inventory for item:', orderItem.item_id, 'change:', quantityChange);
      }
    }

    return {
      success: true,
      message: `Order status updated to ${newStatus}`
    };
  } catch (error) {
    if (error.errorCode) {
      console.error('[SERVICE] updateOrderStatus - Known error:', error.errorCode, error.message);
      throw error;
    }
    console.error('[SERVICE] updateOrderStatus - Error:', error);
    throw createError(
      'Failed to update order status',
      'ORDER_500',
      500,
      { service: 'updateOrderStatus', orderId: id, originalError: error.message }
    );
  }
};

/**
 * Delete order
 */
exports.deleteOrder = async (id, userRole) => {
  console.log('[SERVICE] deleteOrder - Order ID:', id);
  console.log('[SERVICE] deleteOrder - User role:', userRole);
  try {
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      throw createError(
        'Invalid order ID',
        'ORDER_001',
        400,
        { providedId: id }
      );
    }

    // Check authorization - Admin only
    if (!userRole || userRole !== 'admin') {
      throw createError(
        'Insufficient permissions to delete order',
        'ORDER_007',
        403,
        { userRole, requiredRole: 'admin' }
      );
    }

    // Check if order exists
    const existingOrder = await OrderModel.findById(id);
    if (!existingOrder) {
      throw createError(
        `Order not found with ID: ${id}`,
        'ORDER_004',
        404,
        { requestedId: id }
      );
    }

    // Cannot delete completed orders
    if (existingOrder.status === 'completed') {
      throw createError(
        'Cannot delete completed order',
        'ORDER_008',
        400,
        { orderId: id, status: existingOrder.status }
      );
    }

    await OrderModel.delete(id);
    console.log('[SERVICE] deleteOrder - Order deleted successfully');

    return {
      success: true,
      message: 'Order deleted successfully'
    };
  } catch (error) {
    if (error.errorCode) {
      console.error('[SERVICE] deleteOrder - Known error:', error.errorCode, error.message);
      throw error;
    }
    console.error('[SERVICE] deleteOrder - Error:', error);
    throw createError(
      'Failed to delete order',
      'ORDER_500',
      500,
      { service: 'deleteOrder', orderId: id, originalError: error.message }
    );
  }
};
