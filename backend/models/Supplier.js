/**
 * Supplier Model - Database operations for suppliers
 */

const { pool } = require('../config/db');

const SupplierModel = {
  tableName: 'suppliers',

  /**
   * Find all suppliers
   */
  findAll: async () => {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM suppliers ORDER BY name ASC`
      );
      return rows;
    } catch (error) {
      console.error('Error in findAll suppliers:', error);
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
   * Create new supplier
   */
  create: async (supplierData) => {
    try {
      const { name, contact_person, email, phone, address, notes } = supplierData;
      
      const [result] = await pool.execute(
        `INSERT INTO suppliers (name, contact_person, email, phone, address, notes) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, contact_person || null, email || null, phone || null, address || null, notes || null]
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
  }
};

module.exports = SupplierModel;
