/**
 * Order Model - Database operations for orders
 * With detailed console logging for debugging
 */

const { pool } = require('../config/db');

const OrderModel = {
  tableName: 'orders',

  /**
   * Find all orders with optional filters
   */
  findAll: async (options = {}) => {
    try {
      const { search = '', status = null, orderType = null, page = 1, limit = 10 } = options;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        console.log('[MODEL] findAll - Search term:', search);
        whereClause += ' AND (order_number LIKE ? OR notes LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
      }
      
      if (status !== null && status !== '') {
        console.log('[MODEL] findAll - Status filter:', status);
        whereClause += ' AND status = ?';
        params.push(status);
      }
      
      if (orderType !== null && orderType !== '') {
        console.log('[MODEL] findAll - Order type filter:', orderType);
        whereClause += ' AND order_type = ?';
        params.push(orderType);
      }
      
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT o.*, 
          (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
        FROM orders o
        ${whereClause}
        ORDER BY o.created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;
      
      console.log('[MODEL] findAll - Query:', query);
      console.log('[MODEL] findAll - Params:', params);
      const [rows] = await pool.execute(query, params);
      console.log('[MODEL] findAll - Rows found:', rows.length);
      return rows;
    } catch (error) {
      console.error('[MODEL] findAll - Error:', error);
      throw error;
    }
  },

  /**
   * Find order by ID
   */
  findById: async (id) => {
    try {
      console.log('[MODEL] findById - Order ID:', id);
      const [rows] = await pool.execute(
        'SELECT * FROM orders WHERE id = ?',
        [id]
      );
      console.log('[MODEL] findById - Rows found:', rows.length);
      return rows[0] || null;
    } catch (error) {
      console.error('[MODEL] findById - Error:', error.message);
      throw error;
    }
  },

  /**
   * Find order by order number
   */
  findByOrderNumber: async (orderNumber) => {
    try {
      console.log('[MODEL] findByOrderNumber - Order number:', orderNumber);
      const [rows] = await pool.execute(
        'SELECT * FROM orders WHERE order_number = ?',
        [orderNumber]
      );
      console.log('[MODEL] findByOrderNumber - Rows found:', rows.length);
      return rows[0] || null;
    } catch (error) {
      console.error('[MODEL] findByOrderNumber - Error:', error.message);
      throw error;
    }
  },

  /**
   * Get order with items
   */
  findByIdWithItems: async (id) => {
    try {
      console.log('[MODEL] findByIdWithItems - Order ID:', id);
      
      // Get order
      const [orders] = await pool.execute(
        'SELECT * FROM orders WHERE id = ?',
        [id]
      );
      
      if (orders.length === 0) {
        console.log('[MODEL] findByIdWithItems - Order not found');
        return null;
      }
      
      // Get order items
      const [items] = await pool.execute(
        `SELECT oi.*, ii.name as item_name, ii.sku 
         FROM order_items oi 
         LEFT JOIN inventory_items ii ON oi.item_id = ii.id 
         WHERE oi.order_id = ?`,
        [id]
      );
      
      console.log('[MODEL] findByIdWithItems - Items found:', items.length);
      
      return {
        ...orders[0],
        items: items
      };
    } catch (error) {
      console.error('[MODEL] findByIdWithItems - Error:', error.message);
      throw error;
    }
  },

  /**
   * Create new order
   */
  create: async (orderData) => {
    try {
      const { 
        order_number, order_type, supplier_id, status = 'pending', 
        notes, total_amount = 0, created_by 
      } = orderData;
      
      console.log('[MODEL] create - Order data:', orderData);
      
      const [result] = await pool.execute(
        `INSERT INTO orders (order_number, order_type, supplier_id, status, notes, total_amount, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [order_number, order_type, supplier_id || null, status, notes || null, total_amount, created_by || null]
      );
      
      console.log('[MODEL] create - Insert ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('[MODEL] create - Error:', error);
      throw error;
    }
  },

  /**
   * Update order
   */
  update: async (id, orderData) => {
    try {
      const { status, notes, total_amount } = orderData;
      console.log('[MODEL] update - Order ID:', id, 'Data:', orderData);
      
      await pool.execute(
        `UPDATE orders SET status = ?, notes = ?, total_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, notes, total_amount, id]
      );
      
      console.log('[MODEL] update - Updated successfully');
      return true;
    } catch (error) {
      console.error('[MODEL] update - Error:', error);
      throw error;
    }
  },

  /**
   * Update order status
   */
  updateStatus: async (id, status) => {
    try {
      console.log('[MODEL] updateStatus - Order ID:', id, 'New status:', status);
      
      await pool.execute(
        'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );
      
      console.log('[MODEL] updateStatus - Status updated');
      return true;
    } catch (error) {
      console.error('[MODEL] updateStatus - Error:', error);
      throw error;
    }
  },

  /**
   * Delete order
   */
  delete: async (id) => {
    try {
      console.log('[MODEL] delete - Order ID:', id);
      
      // First delete order items
      await pool.execute('DELETE FROM order_items WHERE order_id = ?', [id]);
      console.log('[MODEL] delete - Order items deleted');
      
      // Then delete order
      const [result] = await pool.execute('DELETE FROM orders WHERE id = ?', [id]);
      console.log('[MODEL] delete - Affected rows:', result.affectedRows);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[MODEL] delete - Error:', error);
      throw error;
    }
  },

  /**
   * Add item to order
   */
  addItem: async (orderId, itemData) => {
    try {
      const { item_id, quantity, unit_price, total_price } = itemData;
      console.log('[MODEL] addItem - Order ID:', orderId, 'Item:', itemData);
      
      const [result] = await pool.execute(
        `INSERT INTO order_items (order_id, item_id, quantity, unit_price, total_price) 
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item_id, quantity, unit_price, total_price]
      );
      
      console.log('[MODEL] addItem - Insert ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('[MODEL] addItem - Error:', error);
      throw error;
    }
  },

  /**
   * Remove item from order
   */
  removeItem: async (orderItemId) => {
    try {
      console.log('[MODEL] removeItem - Order item ID:', orderItemId);
      
      const [result] = await pool.execute(
        'DELETE FROM order_items WHERE id = ?',
        [orderItemId]
      );
      
      console.log('[MODEL] removeItem - Affected rows:', result.affectedRows);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[MODEL] removeItem - Error:', error);
      throw error;
    }
  },

  /**
   * Get order items
   */
  getItems: async (orderId) => {
    try {
      console.log('[MODEL] getItems - Order ID:', orderId);
      
      const [items] = await pool.execute(
        `SELECT oi.*, ii.name as item_name, ii.sku 
         FROM order_items oi 
         LEFT JOIN inventory_items ii ON oi.item_id = ii.id 
         WHERE oi.order_id = ?`,
        [orderId]
      );
      
      console.log('[MODEL] getItems - Items found:', items.length);
      return items;
    } catch (error) {
      console.error('[MODEL] getItems - Error:', error);
      throw error;
    }
  },

  /**
   * Generate order number
   */
  generateOrderNumber: async (orderType) => {
    try {
      const prefix = orderType === 'purchase' ? 'PO' : 'SO';
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      
      // Get count of orders today
      const [result] = await pool.execute(
        `SELECT COUNT(*) as count FROM orders 
         WHERE order_number LIKE ? AND DATE(created_at) = CURDATE()`,
        [`${prefix}${dateStr}%`]
      );
      
      const sequence = (result[0].count + 1).toString().padStart(4, '0');
      const orderNumber = `${prefix}${dateStr}${sequence}`;
      
      console.log('[MODEL] generateOrderNumber - Generated:', orderNumber);
      return orderNumber;
    } catch (error) {
      console.error('[MODEL] generateOrderNumber - Error:', error);
      throw error;
    }
  },

  /**
   * Count orders
   */
  count: async (options = {}) => {
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (options.status !== null && options.status !== '') {
        whereClause += ' AND status = ?';
        params.push(options.status);
      }
      
      const [rows] = await pool.execute(
        `SELECT COUNT(*) as total FROM orders ${whereClause}`,
        params
      );
      return rows[0].total;
    } catch (error) {
      console.error('[MODEL] count - Error:', error);
      throw error;
    }
  }
};

module.exports = OrderModel;
