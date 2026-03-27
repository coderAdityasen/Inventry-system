/**
 * Category Model - Database operations for categories
 */

const { pool } = require('../config/db');

const CategoryModel = {
  tableName: 'categories',

  /**
   * Find all categories
   */
  findAll: async () => {
    try {
      console.log('[MODEL] findAll - Fetching all categories');
      const [rows] = await pool.execute(
        `SELECT * FROM categories ORDER BY name ASC`
      );
      console.log('[MODEL] findAll - Categories found:', rows.length);
      return rows;
    } catch (error) {
      console.error('[MODEL] findAll - Error:', error);
      throw error;
    }
  },

  /**
   * Find category by ID
   */
  findById: async (id) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findById category:', error);
      throw error;
    }
  },

  /**
   * Create new category
   */
  create: async (categoryData) => {
    try {
      const { name, description } = categoryData;
      console.log('[MODEL] create - Category data:', categoryData);
      
      const [result] = await pool.execute(
        `INSERT INTO categories (name, description) VALUES (?, ?)`,
        [name, description || null]
      );
      console.log('[MODEL] create - Insert ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('[MODEL] create - Error:', error);
      throw error;
    }
  },

  /**
   * Update category
   */
  update: async (id, categoryData) => {
    try {
      const { name, description } = categoryData;
      console.log('[MODEL] update - Category ID:', id, 'Data:', categoryData);
      
      await pool.execute(
        `UPDATE categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [name, description, id]
      );
      console.log('[MODEL] update - Updated successfully');
      return true;
    } catch (error) {
      console.error('[MODEL] update - Error:', error);
      throw error;
    }
  },

  /**
   * Delete category
   */
  delete: async (id) => {
    try {
      console.log('[MODEL] delete - Category ID:', id);
      const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
      console.log('[MODEL] delete - Affected rows:', result.affectedRows);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('[MODEL] delete - Error:', error);
      throw error;
    }
  }
};

module.exports = CategoryModel;
