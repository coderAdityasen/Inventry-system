/**
 * InventoryItem Model - Database operations for items
 * Implements proper error handling and debug information
 */

const { pool } = require('../config/db');

const InventoryItemModel = {
  tableName: 'inventory_items',

  /**
   * Find all items with pagination and filters
   */
  findAll: async ({ page = 1, limit = 10, search = '', categoryId = null, supplierId = null, sortBy = 'name', sortOrder = 'asc' }) => {
    try {
      const offset = (page - 1) * limit;
      const searchPattern = `%${search}%`;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (i.name LIKE ? OR i.sku LIKE ?)';
        params.push(searchPattern, searchPattern);
      }
      
      if (categoryId) {
        whereClause += ' AND i.category_id = ?';
        params.push(categoryId);
      }
      
      if (supplierId) {
        whereClause += ' AND i.supplier_id = ?';
        params.push(supplierId);
      }

      // Validate sort column
      const validSortColumns = ['name', 'quantity', 'price', 'created_at', 'updated_at'];
      const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'name';
      const safeSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

      // Get total count - use query instead of execute
      const countQuery = `SELECT COUNT(*) as total FROM inventory_items i ${whereClause}`;
      const [countResult] = await pool.query(countQuery, params);
      const totalItems = countResult[0].total;

      // Get items - use query with interpolated LIMIT/OFFSET
      const query = `
        SELECT 
          i.id, i.name, i.sku, i.description, i.quantity, i.price,
          i.category_id, i.supplier_id, i.low_stock_threshold, i.image_url,
          i.created_at, i.updated_at,
          c.name as category_name,
          s.name as supplier_name
        FROM inventory_items i
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN suppliers s ON i.supplier_id = s.id
        ${whereClause}
        ORDER BY i.${safeSortBy} ${safeSortOrder}
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;
      
      const items = await pool.query(query, params);
      
      return {
        items: items[0],
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          itemsPerPage: limit,
          hasNext: page * limit < totalItems,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  },

  /**
   * Find item by ID
   */
  findById: async (id) => {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          i.*, 
          c.name as category_name,
          s.name as supplier_name
        FROM inventory_items i
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN suppliers s ON i.supplier_id = s.id
        WHERE i.id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  },

  /**
   * Find item by SKU
   */
  findBySku: async (sku, excludeId = null) => {
    try {
      let query = 'SELECT id FROM inventory_items WHERE sku = ?';
      const params = [sku];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await pool.execute(query, params);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findBySku:', error);
      throw error;
    }
  },

  /**
   * Create new item
   */
  create: async (itemData) => {
    try {
      const { name, sku, description, quantity, price, category_id, supplier_id, low_stock_threshold, image_url } = itemData;
      
      const [result] = await pool.execute(
        `INSERT INTO inventory_items 
         (name, sku, description, quantity, price, category_id, supplier_id, low_stock_threshold, image_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, sku, description || null, quantity || 0, price || 0, category_id || null, supplier_id || null, low_stock_threshold || 10, image_url || null]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  },

  /**
   * Update item
   */
  update: async (id, itemData) => {
    try {
      const { name, sku, description, quantity, price, category_id, supplier_id, low_stock_threshold, image_url } = itemData;
      
      await pool.execute(
        `UPDATE inventory_items 
         SET name = ?, sku = ?, description = ?, quantity = ?, price = ?, 
             category_id = ?, supplier_id = ?, low_stock_threshold = ?, image_url = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, sku, description, quantity, price, category_id, supplier_id, low_stock_threshold, image_url, id]
      );
      
      return true;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  },

  /**
   * Delete item
   */
  delete: async (id) => {
    try {
      // Check if item has stock before deletion
      const item = await this.findById(id);
      if (item && item.quantity > 0) {
        throw Object.assign(new Error('Cannot delete item with remaining stock'), {
          errorCode: 'ITEM_010',
          statusCode: 409,
          debug: { currentStock: item.quantity }
        });
      }

      const [result] = await pool.execute('DELETE FROM inventory_items WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  },

  /**
   * Get low stock items
   */
  getLowStock: async (threshold = 10) => {
    try {
      const [rows] = await pool.execute(
        `SELECT id, name, sku, quantity, low_stock_threshold 
         FROM inventory_items 
         WHERE quantity <= low_stock_threshold 
         ORDER BY quantity ASC`
      );
      return rows;
    } catch (error) {
      console.error('Error in getLowStock:', error);
      throw error;
    }
  },

  /**
   * Check if category exists
   */
  categoryExists: async (categoryId) => {
    if (!categoryId) return true;
    try {
      const [rows] = await pool.execute('SELECT id FROM categories WHERE id = ?', [categoryId]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error in categoryExists:', error);
      throw error;
    }
  },

  /**
   * Check if supplier exists
   */
  supplierExists: async (supplierId) => {
    if (!supplierId) return true;
    try {
      const [rows] = await pool.execute('SELECT id FROM suppliers WHERE id = ?', [supplierId]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error in supplierExists:', error);
      throw error;
    }
  },

  /**
   * Get item count by category
   */
  countByCategory: async (categoryId) => {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM inventory_items WHERE category_id = ?',
        [categoryId]
      );
      return rows[0].count;
    } catch (error) {
      console.error('Error in countByCategory:', error);
      throw error;
    }
  },

  /**
   * Get item count by supplier
   */
  countBySupplier: async (supplierId) => {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM inventory_items WHERE supplier_id = ?',
        [supplierId]
      );
      return rows[0].count;
    } catch (error) {
      console.error('Error in countBySupplier:', error);
      throw error;
    }
  }
};

module.exports = InventoryItemModel;