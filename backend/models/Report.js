/**
 * Report Model - Database operations for reports and analytics
 * With detailed console logging for debugging
 */

const { pool } = require('../config/db');

const ReportModel = {
  /**
   * Get inventory summary report
   * Returns total items, total stock value, low stock count
   */
  getInventorySummary: async () => {
    try {
      console.log('[MODEL] getInventorySummary - Starting query');
      
      // Get total items and stock
      const [summary] = await pool.execute(`
        SELECT 
          COUNT(*) as total_items,
          SUM(quantity) as total_quantity,
          COALESCE(SUM(quantity * price), 0) as total_value,
          SUM(CASE WHEN quantity <= low_stock_threshold THEN 1 ELSE 0 END) as low_stock_count,
          SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count
        FROM inventory_items
      `);
      
      console.log('[MODEL] getInventorySummary - Summary result:', summary[0]);
      return summary[0];
    } catch (error) {
      console.error('[MODEL] getInventorySummary - Error:', error.message);
      throw error;
    }
  },

  /**
   * Get inventory by category
   * Returns stock breakdown by category
   */
  getInventoryByCategory: async () => {
    try {
      console.log('[MODEL] getInventoryByCategory - Starting query');
      
      const [results] = await pool.execute(`
        SELECT 
          c.id as category_id,
          c.name as category_name,
          COUNT(i.id) as item_count,
          SUM(i.quantity) as total_quantity,
          COALESCE(SUM(i.quantity * i.price), 0) as total_value
        FROM categories c
        LEFT JOIN inventory_items i ON c.id = i.category_id
        GROUP BY c.id, c.name
        ORDER BY total_value DESC
      `);
      
      console.log('[MODEL] getInventoryByCategory - Results count:', results.length);
      return results;
    } catch (error) {
      console.error('[MODEL] getInventoryByCategory - Error:', error.message);
      throw error;
    }
  },

  /**
   * Get inventory by supplier
   * Returns stock breakdown by supplier
   */
  getInventoryBySupplier: async () => {
    try {
      console.log('[MODEL] getInventoryBySupplier - Starting query');
      
      const [results] = await pool.execute(`
        SELECT 
          s.id as supplier_id,
          s.name as supplier_name,
          COUNT(i.id) as item_count,
          SUM(i.quantity) as total_quantity,
          COALESCE(SUM(i.quantity * i.price), 0) as total_value
        FROM suppliers s
        LEFT JOIN inventory_items i ON s.id = i.supplier_id
        WHERE s.is_active = TRUE
        GROUP BY s.id, s.name
        ORDER BY total_value DESC
      `);
      
      console.log('[MODEL] getInventoryBySupplier - Results count:', results.length);
      return results;
    } catch (error) {
      console.error('[MODEL] getInventoryBySupplier - Error:', error.message);
      throw error;
    }
  },

  /**
   * Get low stock items
   * Returns items at or below their reorder threshold
   */
  getLowStockItems: async (limit = 20) => {
    try {
      console.log('[MODEL] getLowStockItems - Starting query with limit:', limit);
      
      const [results] = await pool.query(`
        SELECT 
          i.id,
          i.name,
          i.sku,
          i.quantity,
          i.low_stock_threshold,
          i.price,
          c.name as category_name,
          s.name as supplier_name,
          (i.low_stock_threshold - i.quantity) as deficit
        FROM inventory_items i
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN suppliers s ON i.supplier_id = s.id
        WHERE i.quantity <= i.low_stock_threshold
        ORDER BY deficit DESC
        LIMIT ?
      `, [limit]);
      
      console.log('[MODEL] getLowStockItems - Results count:', results.length);
      return results;
    } catch (error) {
      console.error('[MODEL] getLowStockItems - Error:', error.message);
      throw error;
    }
  },

  /**
   * Get out of stock items
   * Returns items with zero quantity
   */
  getOutOfStockItems: async (limit = 20) => {
    try {
      console.log('[MODEL] getOutOfStockItems - Starting query with limit:', limit);
      
      const [results] = await pool.query(`
        SELECT 
          i.id,
          i.name,
          i.sku,
          i.quantity,
          i.low_stock_threshold,
          i.price,
          c.name as category_name,
          s.name as supplier_name
        FROM inventory_items i
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN suppliers s ON i.supplier_id = s.id
        WHERE i.quantity = 0
        ORDER BY i.name ASC
        LIMIT ?
      `, [limit]);
      
      console.log('[MODEL] getOutOfStockItems - Results count:', results.length);
      return results;
    } catch (error) {
      console.error('[MODEL] getOutOfStockItems - Error:', error.message);
      throw error;
    }
  },

  /**
   * Get sales summary report
   * Returns total sales, revenue, order counts
   */
  getSalesSummary: async (startDate = null, endDate = null) => {
    try {
      console.log('[MODEL] getSalesSummary - Date range:', { startDate, endDate });
      
      let query = `
        SELECT 
          COUNT(*) as total_orders,
          SUM(total_amount) as total_revenue,
          SUM(CASE WHEN order_type = 'sale' THEN total_amount ELSE 0 END) as sale_revenue,
          SUM(CASE WHEN order_type = 'purchase' THEN total_amount ELSE 0 END) as purchase_cost,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
        FROM orders
        WHERE status = 'completed'
      `;
      
      const params = [];
      
      if (startDate && endDate) {
        query += ` AND DATE(created_at) BETWEEN ? AND ?`;
        params.push(startDate, endDate);
      }
      
      const [result] = await pool.execute(query, params);
      
      console.log('[MODEL] getSalesSummary - Summary result:', result[0]);
      return result[0];
    } catch (error) {
      console.error('[MODEL] getSalesSummary - Error:', error.message);
      throw error;
    }
  },

  /**
   * Get sales by date
   * Returns daily/weekly/monthly sales data
   */
  getSalesByDate: async (startDate, endDate, groupBy = 'day') => {
    try {
      console.log('[MODEL] getSalesByDate - Params:', { startDate, endDate, groupBy });
      
      const [results] = await pool.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as order_count,
          SUM(total_amount) as revenue
        FROM orders
        WHERE status = 'completed'
          AND order_type = 'sale'
          AND DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [startDate, endDate]);
      
      console.log('[MODEL] getSalesByDate - Results count:', results.length);
      return results;
    } catch (error) {
      console.error('[MODEL] getSalesByDate - Error:', error.message);
      throw error;
    }
  },

  /**
   * Get top selling items
   * Returns items with highest sales volume
   */
  getTopSellingItems: async (startDate = null, endDate = null, limit = 10) => {
    try {
      console.log('[MODEL] getTopSellingItems - Params:', { startDate, endDate, limit });
      
      let query = `
        SELECT 
          i.id,
          i.name,
          i.sku,
          SUM(oi.quantity) as total_sold,
          SUM(oi.total_price) as total_revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN inventory_items i ON oi.item_id = i.id
        WHERE o.status = 'completed' AND o.order_type = 'sale'
      `;
      
      const params = [];
      
      if (startDate && endDate) {
        query += ` AND DATE(o.created_at) BETWEEN ? AND ?`;
        params.push(startDate, endDate);
      }
      
      query += `
        GROUP BY i.id, i.name, i.sku
        ORDER BY total_sold DESC
        LIMIT ?
      `;
      params.push(limit);
      
      const [results] = await pool.query(query, params);
      
      console.log('[MODEL] getTopSellingItems - Results count:', results.length);
      return results;
    } catch (error) {
      console.error('[MODEL] getTopSellingItems - Error:', error.message);
      throw error;
    }
  },

  /**
   * Get top suppliers by purchase
   * Returns suppliers with highest purchase volume
   */
  getTopSuppliers: async (startDate = null, endDate = null, limit = 10) => {
    try {
      console.log('[MODEL] getTopSuppliers - Params:', { startDate, endDate, limit });
      
      let query = `
        SELECT 
          s.id,
          s.name,
          COUNT(o.id) as order_count,
          SUM(o.total_amount) as total_purchase
        FROM orders o
        JOIN suppliers s ON o.supplier_id = s.id
        WHERE o.status = 'completed' AND o.order_type = 'purchase'
      `;
      
      const params = [];
      
      if (startDate && endDate) {
        query += ` AND DATE(o.created_at) BETWEEN ? AND ?`;
        params.push(startDate, endDate);
      }
      
      query += `
        GROUP BY s.id, s.name
        ORDER BY total_purchase DESC
        LIMIT ?
      `;
      params.push(limit);
      
      const [results] = await pool.query(query, params);
      
      console.log('[MODEL] getTopSuppliers - Results count:', results.length);
      return results;
    } catch (error) {
      console.error('[MODEL] getTopSuppliers - Error:', error.message);
      throw error;
    }
  },

  /**
   * Get category performance
   * Returns sales breakdown by category
   */
  getCategoryPerformance: async (startDate = null, endDate = null) => {
    try {
      console.log('[MODEL] getCategoryPerformance - Date range:', { startDate, endDate });
      
      let query = `
        SELECT 
          c.id as category_id,
          c.name as category_name,
          COUNT(DISTINCT oi.item_id) as items_sold,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.total_price) as total_revenue
        FROM categories c
        LEFT JOIN inventory_items i ON c.id = i.category_id
        LEFT JOIN order_items oi ON i.id = oi.item_id
        LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'completed' AND o.order_type = 'sale'
      `;
      
      const params = [];
      
      if (startDate && endDate) {
        query += ` AND DATE(o.created_at) BETWEEN ? AND ?`;
        params.push(startDate, endDate);
      }
      
      query += `
        GROUP BY c.id, c.name
        ORDER BY total_revenue DESC
      `;
      
      const [results] = await pool.query(query, params);
      
      console.log('[MODEL] getCategoryPerformance - Results count:', results.length);
      return results;
    } catch (error) {
      console.error('[MODEL] getCategoryPerformance - Error:', error.message);
      throw error;
    }
  },

  /**
   * Get dashboard summary
   * Returns key metrics for dashboard
   */
  getDashboardSummary: async () => {
    try {
      console.log('[MODEL] getDashboardSummary - Starting queries');
      
      // Get inventory summary
      const [inventory] = await pool.execute(`
        SELECT 
          COUNT(*) as total_items,
          SUM(quantity) as total_quantity,
          COALESCE(SUM(quantity * price), 0) as total_value,
          SUM(CASE WHEN quantity <= low_stock_threshold THEN 1 ELSE 0 END) as low_stock_count
        FROM inventory_items
      `);
      
      // Get recent orders count
      const [orders] = await pool.execute(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
          SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as orders_this_week
        FROM orders
      `);
      
      // Get suppliers count
      const [suppliers] = await pool.execute(`
        SELECT 
          COUNT(*) as total_suppliers,
          SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_suppliers
        FROM suppliers
      `);
      
      // Get categories count
      const [categories] = await pool.execute(`
        SELECT COUNT(*) as total_categories FROM categories
      `);
      
      const summary = {
        inventory: inventory[0],
        orders: orders[0],
        suppliers: suppliers[0],
        categories: categories[0]
      };
      
      console.log('[MODEL] getDashboardSummary - Summary:', summary);
      return summary;
    } catch (error) {
      console.error('[MODEL] getDashboardSummary - Error:', error.message);
      throw error;
    }
  },

  /**
   * Get recent activity
   * Returns recent orders and inventory changes
   */
  getRecentActivity: async (limit = 10) => {
    try {
      console.log('[MODEL] getRecentActivity - Starting query with limit:', limit);
      
      // Use separate queries to avoid UNION issues with prepared statements
      const [orderResults] = await pool.query(`
        SELECT 
          'order' as type,
          o.id,
          o.order_number as reference,
          o.order_type,
          o.status,
          o.total_amount as amount,
          o.created_at as timestamp
        FROM orders o
        ORDER BY o.created_at DESC
        LIMIT ?
      `, [limit]);
      
      const [inventoryResults] = await pool.query(`
        SELECT 
          'inventory' as type,
          i.id,
          i.name as reference,
          'stock_update' as order_type,
          'updated' as status,
          i.quantity as amount,
          i.updated_at as timestamp
        FROM inventory_items i
        ORDER BY i.updated_at DESC
        LIMIT ?
      `, [limit]);
      
      // Combine and sort results
      const combinedResults = [...orderResults, ...inventoryResults]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
      
      console.log('[MODEL] getRecentActivity - Results count:', combinedResults.length);
      return combinedResults;
    } catch (error) {
      console.error('[MODEL] getRecentActivity - Error:', error.message);
      throw error;
    }
  }
};

module.exports = ReportModel;