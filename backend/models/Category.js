/**
 * Category Model - Database operations for categories
 */

const { pool } = require('../config/db');

const CategoryModel = {
  tableName: 'categories',

  /**
   * Find all categories with item counts
   */
  findAll: async () => {
    try {
      console.log('[MODEL] findAll - Fetching all categories');
      const [rows] = await pool.execute(
        `SELECT c.*, 
          (SELECT COUNT(*) FROM inventory_items WHERE category_id = c.id) as item_count
         FROM categories c 
         ORDER BY c.name ASC`
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
      const { name, description, parent_id, display_order, meta_title, meta_description } = categoryData;
      console.log('[MODEL] create - Category data:', categoryData);
      
      const [result] = await pool.execute(
        `INSERT INTO categories (name, description, parent_id, display_order, meta_title, meta_description) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, description || null, parent_id || null, display_order || 0, meta_title || null, meta_description || null]
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
      const { name, description, is_active, parent_id, display_order, meta_title, meta_description } = categoryData;
      console.log('[MODEL] update - Category ID:', id, 'Data:', categoryData);
      
      // Get current category to preserve is_active if not provided
      const [current] = await pool.execute('SELECT is_active FROM categories WHERE id = ?', [id]);
      const currentIsActive = current[0]?.is_active;
      
      await pool.execute(
        `UPDATE categories SET 
          name = ?, 
          description = ?, 
          is_active = ?,
          parent_id = ?,
          display_order = ?,
          meta_title = ?,
          meta_description = ?,
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?`,
        [
          name, 
          description, 
          is_active !== undefined ? is_active : currentIsActive,
          parent_id || null,
          display_order || 0,
          meta_title || null,
          meta_description || null,
          id
        ]
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
  },

  /**
   * Get category statistics
   */
  getStats: async () => {
    try {
      console.log('[MODEL] getStats - Getting category stats');
      
      // Get total categories
      const [totalResult] = await pool.execute('SELECT COUNT(*) as total FROM categories');
      const totalCategories = totalResult[0].total;
      
      // Get total items in categories
      const [itemsResult] = await pool.execute(
        `SELECT COUNT(*) as total FROM inventory_items WHERE category_id IS NOT NULL`
      );
      const totalProductsCategorized = itemsResult[0].total;
      
      // Get empty categories (no items)
      const [emptyResult] = await pool.execute(
        `SELECT COUNT(*) as total FROM categories c 
         WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE category_id = c.id)`
      );
      const emptyCategories = emptyResult[0].total;
      
      // Get most used category
      const [mostUsedResult] = await pool.execute(
        `SELECT c.id, c.name, COUNT(i.id) as item_count 
         FROM categories c 
         LEFT JOIN inventory_items i ON c.id = i.category_id 
         GROUP BY c.id 
         ORDER BY item_count DESC 
         LIMIT 1`
      );
      
      // Get total items in inventory
      const [allItemsResult] = await pool.execute('SELECT COUNT(*) as total FROM inventory_items');
      const totalItems = allItemsResult[0].total;
      
      console.log('[MODEL] getStats - Stats:', {
        totalCategories,
        totalProductsCategorized,
        emptyCategories,
        mostUsed: mostUsedResult[0]
      });
      
      return {
        totalCategories,
        totalProductsCategorized,
        emptyCategories,
        mostUsedCategory: mostUsedResult[0]?.name || null,
        mostUsedCategoryId: mostUsedResult[0]?.id || null,
        mostUsedCategoryCount: mostUsedResult[0]?.item_count || 0,
        totalItemsInInventory: totalItems
      };
    } catch (error) {
      console.error('[MODEL] getStats - Error:', error);
      throw error;
    }
  }
};

module.exports = CategoryModel;
