/**
 * User Model for MySQL
 */

const { pool } = require('../config/db');

const UserModel = {
  tableName: 'users',

  /**
   * Find user by email
   */
  findByEmail: async (email) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Find user by ID
   */
  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Find user by ID with password (for authentication)
   */
  findByIdWithPassword: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create new user
   */
  create: async (userData) => {
    const { name, email, password, role = 'staff' } = userData;
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return result.insertId;
  },

  /**
   * Update refresh token
   */
  updateRefreshToken: async (userId, refreshToken) => {
    await pool.execute(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, userId]
    );
  },

  /**
   * Find user by refresh token
   */
  findByRefreshToken: async (refreshToken) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE refresh_token = ?',
      [refreshToken]
    );
    return rows[0] || null;
  },

  /**
   * Clear refresh token
   */
  clearRefreshToken: async (userId) => {
    await pool.execute(
      'UPDATE users SET refresh_token = NULL WHERE id = ?',
      [userId]
    );
  },

  /**
   * Get all users (admin only)
   */
  getAll: async () => {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },

  /**
   * Update user
   */
  update: async (id, userData) => {
    const { name, email, role, is_active } = userData;
    await pool.execute(
      'UPDATE users SET name = ?, email = ?, role = ?, is_active = ? WHERE id = ?',
      [name, email, role, is_active, id]
    );
  },

  /**
   * Check if email exists (excluding specific user)
   */
  emailExists: async (email, excludeId = null) => {
    let query = 'SELECT id FROM users WHERE email = ?';
    const params = [email];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
  }
};

module.exports = UserModel;
