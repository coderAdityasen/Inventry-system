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
  }
};

module.exports = SupplierModel;
