/**
 * Supplier Model - Database operations for suppliers
 */

const { pool } = require('../config/db');

const SupplierModel = {
  tableName: 'suppliers',

  /**
   * Find all suppliers with optional filters
   */
  findAll: async (options = {}) => {
    try {
      const { search = '', isActive = null, page = 1, limit = 10 } = options;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        console.log('[MODEL] findAll - Search term:', search);
        whereClause += ' AND (name LIKE ? OR email LIKE ? OR contact_person LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }
      
      if (isActive !== null) {
        console.log('[MODEL] findAll - isActive filter:', isActive);
        whereClause += ' AND is_active = ?';
        params.push(isActive);
      }
      
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT * FROM suppliers 
        ${whereClause} 
        ORDER BY name ASC 
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
   * Find supplier by ID
   */
  findById: async (id) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM suppliers WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findById supplier:', error);
      throw error;
    }
  },

  /**
   * Find supplier by email
   */
  findByEmail: async (email) => {
    try {
      console.log('[MODEL] findByEmail - Searching for email:', email);
      const [rows] = await pool.execute(
        'SELECT * FROM suppliers WHERE email = ?',
        [email]
      );
      console.log('[MODEL] findByEmail - Found rows:', rows.length);
      return rows[0] || null;
    } catch (error) {
      console.error('[MODEL] findByEmail - Error:', error.message);
      throw error;
    }
  },

  /**
   * Create new supplier
   */
  create: async (supplierData) => {
    try {
      const { name, contact_person, email, phone, address, notes, is_active = true } = supplierData;
      
      const [result] = await pool.execute(
        `INSERT INTO suppliers (name, contact_person, email, phone, address, notes, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, contact_person || null, email || null, phone || null, address || null, notes || null, is_active]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error in create supplier:', error);
      throw error;
    }
  },

  /**
   * Update supplier
   */
  update: async (id, supplierData) => {
    try {
      const { name, contact_person, email, phone, address, notes } = supplierData;
      
      await pool.execute(
        `UPDATE suppliers SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [name, contact_person, email, phone, address, notes, id]
      );
      
      return true;
    } catch (error) {
      console.error('Error in update supplier:', error);
      throw error;
    }
  },

  /**
   * Update supplier status (active/inactive)
   */
  updateStatus: async (id, isActive) => {
    try {
      await pool.execute(
        'UPDATE suppliers SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [isActive, id]
      );
      return true;
    } catch (error) {
      console.error('Error in updateStatus supplier:', error);
      throw error;
    }
  },

  /**
   * Delete supplier
   */
  delete: async (id) => {
    try {
      const [result] = await pool.execute('DELETE FROM suppliers WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in delete supplier:', error);
      throw error;
    }
  },

  /**
   * Count total suppliers
   */
  count: async (options = {}) => {
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (options.isActive !== null) {
        whereClause += ' AND is_active = ?';
        params.push(options.isActive);
      }
      
      const [rows] = await pool.execute(
        `SELECT COUNT(*) as total FROM suppliers ${whereClause}`,
        params
      );
      return rows[0].total;
    } catch (error) {
      console.error('Error in count suppliers:', error);
      throw error;
    }
  },

  /**
   * Get supplier statistics for dashboard
   */
  getStats: async () => {
    try {
      // Get total, active, and inactive counts
      const [counts] = await pool.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive
        FROM suppliers
      `);
      
      // Get total purchase value from purchase orders
      const [purchaseData] = await pool.execute(`
        SELECT COALESCE(SUM(total_amount), 0) as totalPurchaseValue
        FROM orders 
        WHERE order_type = 'purchase' AND status != 'cancelled'
      `);
      
      return {
        total: counts[0].total || 0,
        active: counts[0].active || 0,
        inactive: counts[0].inactive || 0,
        totalPurchaseValue: parseFloat(purchaseData[0].totalPurchaseValue) || 0
      };
    } catch (error) {
      console.error('[MODEL] getStats - Error:', error);
      throw error;
    }
  },

  /**
   * Get supplier with purchase stats
   */
  findWithPurchaseStats: async (id) => {
    try {
      // Get supplier basic info
      const [supplier] = await pool.execute('SELECT * FROM suppliers WHERE id = ?', [id]);
      if (!supplier[0]) return null;
      
      // Get purchase order stats for this supplier
      const [orderStats] = await pool.execute(`
        SELECT 
          COUNT(*) as totalOrders,
          COALESCE(SUM(total_amount), 0) as totalAmount,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedOrders,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingOrders,
          SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processingOrders,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledOrders
        FROM orders 
        WHERE supplier_id = ? AND order_type = 'purchase'
      `, [id]);
      
      // Get linked items count
      const [itemsCount] = await pool.execute(
        'SELECT COUNT(*) as itemCount FROM inventory_items WHERE supplier_id = ?',
        [id]
      );
      
      return {
        ...supplier[0],
        orderStats: orderStats[0],
        itemCount: itemsCount[0].itemCount
      };
    } catch (error) {
      console.error('[MODEL] findWithPurchaseStats - Error:', error);
      throw error;
    }
  }
};

module.exports = SupplierModel;
