/**
 * Order Controller - Request handlers for orders
 * With detailed console logging for debugging
 */

const orderService = require('../services/orderService');

/**
 * Helper function to handle errors
 */
const handleError = (error, res, operation) => {
  console.error(`[CONTROLLER] Error in ${operation}:`, {
    message: error.message,
    errorCode: error.errorCode,
    statusCode: error.statusCode,
    stack: error.stack,
    debug: error.debug
  });
  
  const statusCode = error.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: error.message || 'An error occurred',
    errorCode: error.errorCode || 'ORDER_500',
    timestamp: new Date().toISOString()
  });
};

/**
 * Get all orders
 */
exports.getAllOrders = async (req, res, next) => {
  console.log('[CONTROLLER] getAllOrders - Request query:', req.query);
  try {
    const { page = 1, limit = 10, search = '', status = '', orderType = '' } = req.query;
    
    const response = await orderService.getAllOrders({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      status: status || null,
      orderType: orderType || null
    });
    
    console.log('[CONTROLLER] getAllOrders - Sending response:', { 
      statusCode: 200, 
      dataCount: response.data?.length 
    });
    
    res.status(200).json(response);
  } catch (error) {
    handleError(error, res, 'getAllOrders');
  }
};

/**
 * Get order by ID
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[CONTROLLER] getOrderById - Order ID:', id);
    
    const response = await orderService.getOrderById(id);
    
    console.log('[CONTROLLER] getOrderById - Sending response:', { 
      statusCode: 200, 
      orderNumber: response.data?.order_number 
    });
    
    res.status(200).json(response);
  } catch (error) {
    handleError(error, res, 'getOrderById');
  }
};

/**
 * Create new order
 */
exports.createOrder = async (req, res, next) => {
  try {
    const orderData = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    console.log('[CONTROLLER] createOrder - Request body:', orderData);
    console.log('[CONTROLLER] createOrder - User:', { userId, userRole });
    
    const response = await orderService.createOrder(orderData, userId, userRole);
    
    console.log('[CONTROLLER] createOrder - Sending response:', { 
      statusCode: 201, 
      ...response 
    });
    
    res.status(201).json(response);
  } catch (error) {
    handleError(error, res, 'createOrder');
  }
};

/**
 * Update order
 */
exports.updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orderData = req.body;
    const userRole = req.user?.role;
    
    console.log('[CONTROLLER] updateOrder - Order ID:', id, 'Data:', orderData);
    console.log('[CONTROLLER] updateOrder - User role:', userRole);
    
    const response = await orderService.updateOrder(id, orderData, userRole);
    
    console.log('[CONTROLLER] updateOrder - Sending response:', { 
      statusCode: 200, 
      ...response 
    });
    
    res.status(200).json(response);
  } catch (error) {
    handleError(error, res, 'updateOrder');
  }
};

/**
 * Update order status
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userRole = req.user?.role;
    
    console.log('[CONTROLLER] updateOrderStatus - Order ID:', id, 'Status:', status);
    console.log('[CONTROLLER] updateOrderStatus - User role:', userRole);
    
    const response = await orderService.updateOrderStatus(id, status, userRole);
    
    console.log('[CONTROLLER] updateOrderStatus - Sending response:', { 
      statusCode: 200, 
      ...response 
    });
    
    res.status(200).json(response);
  } catch (error) {
    handleError(error, res, 'updateOrderStatus');
  }
};

/**
 * Delete order
 */
exports.deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    
    console.log('[CONTROLLER] deleteOrder - Order ID:', id);
    console.log('[CONTROLLER] deleteOrder - User role:', userRole);
    
    const response = await orderService.deleteOrder(id, userRole);
    
    console.log('[CONTROLLER] deleteOrder - Sending response:', { 
      statusCode: 200, 
      ...response 
    });
    
    res.status(200).json(response);
  } catch (error) {
    handleError(error, res, 'deleteOrder');
  }
};
