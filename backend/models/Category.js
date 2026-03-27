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
      const [rows] = await pool.execute(
        `SELECT * FROM categories ORDER BY name ASC`
      );
      return rows;
    } catch (error) {
      console.error('Error in findAll categories:', error);
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
      
      const [result] = await pool.execute(
        `INSERT INTO categories (name, description) VALUES (?, ?)`,
        [name, description || null]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error in create category:', error);
      throw error;
    }
  },

  /**
   * Update category
   */
  update: async (id, categoryData) => {
    try {
      const { name, description } = categoryData;
      
      await pool.execute(
        `UPDATE categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [name, description, id]
      );
      
      return true;
    } catch (error) {
      console.error('Error in update category:', error);
      throw error;
    }
  },

  /**
   * Delete category
   */
  delete: async (id) => {
    try {
      const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in delete category:', error);
      throw error;
    }
  }
};

module.exports = CategoryModel;
