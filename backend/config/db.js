const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST ,
  port: process.env.DB_PORT ,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

const pool = mysql.createPool(dbConfig);

const initDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'adityasen'
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'root_inventory'}`);
  await connection.end();

  const poolConnection = await pool.getConnection();
  
  await poolConnection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
      is_active BOOLEAN DEFAULT TRUE,
      refresh_token TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  
  await poolConnection.query(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sku VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      quantity INT DEFAULT 0,
      price DECIMAL(10, 2) DEFAULT 0,
      category_id INT,
      supplier_id INT,
      low_stock_threshold INT DEFAULT 10,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  
  await poolConnection.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      parent_id INT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  // Add is_active column to categories if it doesn't exist
  try {
    await poolConnection.query(`
      ALTER TABLE categories
      ADD COLUMN is_active BOOLEAN DEFAULT TRUE
    `);
  } catch (err) {
    // Column may already exist, ignore error
  }

  try {
    await poolConnection.query(`
      ALTER TABLE categories
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
  } catch (err) {
    // Column may already exist, ignore error
  }

  await poolConnection.query(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      contact_person VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(50),
      address TEXT,
      notes TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Add email column if it doesn't exist (for existing tables)
  try {
    await poolConnection.query(`
      ALTER TABLE suppliers
      ADD COLUMN email VARCHAR(255) UNIQUE
    `);
  } catch (err) {
    // Column may already exist, ignore error
  }

  // Add contact_person column if it doesn't exist (for existing tables)
  try {
    await poolConnection.query(`
      ALTER TABLE suppliers
      ADD COLUMN contact_person VARCHAR(255)
    `);
  } catch (err) {
    // Column may already exist, ignore error
  }

  // Add phone column if it doesn't exist
  try {
    await poolConnection.query(`
      ALTER TABLE suppliers
      ADD COLUMN phone VARCHAR(50)
    `);
  } catch (err) {
    // Column may already exist, ignore error
  }

  // Add address column if it doesn't exist
  try {
    await poolConnection.query(`
      ALTER TABLE suppliers
      ADD COLUMN address TEXT
    `);
  } catch (err) {
    // Column may already exist, ignore error
  }

  // Add notes column if it doesn't exist
  try {
    await poolConnection.query(`
      ALTER TABLE suppliers
      ADD COLUMN notes TEXT
    `);
  } catch (err) {
    // Column may already exist, ignore error
  }

  // Add is_active column if it doesn't exist
  try {
    await poolConnection.query(`
      ALTER TABLE suppliers
      ADD COLUMN is_active BOOLEAN DEFAULT TRUE
    `);
  } catch (err) {
    // Column may already exist, ignore error
  }

  // Add updated_at column if it doesn't exist
  try {
    await poolConnection.query(`
      ALTER TABLE suppliers
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
  } catch (err) {
    // Column may already exist, ignore error
  }
  
  await poolConnection.query(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_id INT NOT NULL,
      quantity_change INT NOT NULL,
      movement_type ENUM('purchase', 'sale', 'adjustment', 'return', 'transfer') NOT NULL,
      notes TEXT,
      performed_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
      FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Orders table
  await poolConnection.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      order_type ENUM('purchase', 'sale') NOT NULL,
      supplier_id INT,
      status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
      notes TEXT,
      total_amount DECIMAL(10, 2) DEFAULT 0,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Order items table
  await poolConnection.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      item_id INT NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(10, 2) DEFAULT 0,
      total_price DECIMAL(10, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
    )
  `);
  
  await poolConnection.query(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_id INT NOT NULL,
      alert_type ENUM('low_stock', 'out_of_stock', 'overstock') NOT NULL,
      severity ENUM('info', 'warning', 'critical') DEFAULT 'warning',
      is_acknowledged BOOLEAN DEFAULT FALSE,
      acknowledged_by INT,
      acknowledged_at TIMESTAMP NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
      FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  
  await poolConnection.query(`
    CREATE TABLE IF NOT EXISTS alert_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      default_low_stock_threshold INT DEFAULT 10,
      email_notifications BOOLEAN DEFAULT TRUE,
      daily_summary BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  
  // Insert default alert settings if not exists
  await poolConnection.query(`
    INSERT IGNORE INTO alert_settings (id, default_low_stock_threshold, email_notifications, daily_summary)
    VALUES (1, 10, TRUE, FALSE)
  `);
  
  poolConnection.release();
  console.log('Database initialized successfully');
};

module.exports = { pool, initDatabase };
