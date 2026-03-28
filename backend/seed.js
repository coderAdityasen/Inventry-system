// Seed script to insert sample data into the database
// Run with: node seed.js

const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'inventory_user',
  password: process.env.DB_PASSWORD || 'inventory_pass',
  database: process.env.DB_NAME || 'inventory_db'
};

async function seed() {
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('[SEED] Connected to database');
  
  try {
    // Insert sample categories
    console.log('[SEED] Inserting categories...');
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and accessories' },
      { name: 'Clothing', description: 'Apparel and fashion items' },
      { name: 'Home & Garden', description: 'Home improvement and garden supplies' },
      { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
      { name: 'Books & Media', description: 'Books, music, and video media' },
      { name: 'Toys & Games', description: 'Toys, games, and puzzles' },
      { name: 'Health & Beauty', description: 'Health products and beauty items' },
      { name: 'Office Supplies', description: 'Office and school supplies' }
    ];
    
    for (const cat of categories) {
      try {
        await connection.execute(
          'INSERT INTO categories (name, description) VALUES (?, ?)',
          [cat.name, cat.description]
        );
        console.log(`[SEED] Inserted category: ${cat.name}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`[SEED] Category already exists: ${cat.name}`);
        } else {
          console.error(`[SEED] Error inserting category ${cat.name}:`, err.message);
        }
      }
    }
    
    // Insert sample suppliers
    console.log('\n[SEED] Inserting suppliers...');
    const suppliers = [
      { name: 'TechWorld Distributors', contact_person: 'John Smith', email: 'techworld@example.com', phone: '+1234567890', address: '123 Tech Street, Silicon Valley, CA' },
      { name: 'Fashion Forward Inc', contact_person: 'Sarah Johnson', email: 'fashionforward@example.com', phone: '+1234567891', address: '456 Fashion Ave, New York, NY' },
      { name: 'Home Essentials Co', contact_person: 'Mike Brown', email: 'homeessentials@example.com', phone: '+1234567892', address: '789 Home Lane, Chicago, IL' },
      { name: 'Sports Gear Suppliers', contact_person: 'Lisa Davis', email: 'sportsgear@example.com', phone: '+1234567893', address: '321 Sports Blvd, Denver, CO' },
      { name: 'Global Books Ltd', contact_person: 'Robert Wilson', email: 'globalbooks@example.com', phone: '+1234567894', address: '654 Book Street, Boston, MA' },
      { name: 'Beauty & Health Distributors', contact_person: 'Emily Chen', email: 'beautyhealth@example.com', phone: '+1234567895', address: '987 Beauty Road, Los Angeles, CA' },
      { name: 'Office Pro Supplies', contact_person: 'James Miller', email: 'officepro@example.com', phone: '+1234567896', address: '147 Office Park, Seattle, WA' },
      { name: 'Toy World International', contact_person: 'Amanda White', email: 'toyworld@example.com', phone: '+1234567897', address: '258 Toy Lane, Orlando, FL' }
    ];
    
    for (const sup of suppliers) {
      try {
        await connection.execute(
          'INSERT INTO suppliers (name, contact_person, email, phone, address, is_active) VALUES (?, ?, ?, ?, ?, ?)',
          [sup.name, sup.contact_person, sup.email, sup.phone, sup.address, true]
        );
        console.log(`[SEED] Inserted supplier: ${sup.name}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`[SEED] Supplier already exists: ${sup.email}`);
        } else {
          console.error(`[SEED] Error inserting supplier ${sup.name}:`, err.message);
        }
      }
    }
    
    // Insert sample inventory items
    console.log('\n[SEED] Inserting inventory items...');
    const items = [
      { name: 'Wireless Bluetooth Headphones', sku: 'ELEC-001', description: 'High-quality wireless headphones with noise cancellation', quantity: 50, price: 79.99, category_id: 1, supplier_id: 1, low_stock_threshold: 10 },
      { name: 'Smart Watch Pro', sku: 'ELEC-002', description: 'Advanced smartwatch with fitness tracking', quantity: 25, price: 299.99, category_id: 1, supplier_id: 1, low_stock_threshold: 5 },
      { name: 'USB-C Charging Cable', sku: 'ELEC-003', description: 'Fast charging USB-C cable, 2m length', quantity: 200, price: 9.99, category_id: 1, supplier_id: 1, low_stock_threshold: 50 },
      { name: 'Portable Power Bank 10000mAh', sku: 'ELEC-004', description: 'Compact power bank with fast charging', quantity: 0, price: 29.99, category_id: 1, supplier_id: 1, low_stock_threshold: 15 },
      { name: 'Men\'s Cotton T-Shirt', sku: 'CLTH-001', description: 'Comfortable cotton t-shirt, available in multiple colors', quantity: 150, price: 19.99, category_id: 2, supplier_id: 2, low_stock_threshold: 30 },
      { name: 'Women\'s Running Shoes', sku: 'CLTH-002', description: 'Lightweight running shoes with memory foam', quantity: 75, price: 89.99, category_id: 2, supplier_id: 2, low_stock_threshold: 20 },
      { name: 'Denim Jeans Classic Fit', sku: 'CLTH-003', description: 'Classic fit denim jeans', quantity: 8, price: 49.99, category_id: 2, supplier_id: 2, low_stock_threshold: 15 },
      { name: 'Winter Jacket Waterproof', sku: 'CLTH-004', description: 'Warm winter jacket with waterproof coating', quantity: 0, price: 129.99, category_id: 2, supplier_id: 2, low_stock_threshold: 10 },
      { name: 'Garden Tool Set', sku: 'HOME-001', description: 'Complete 12-piece garden tool set', quantity: 40, price: 59.99, category_id: 3, supplier_id: 3, low_stock_threshold: 10 },
      { name: 'LED Desk Lamp', sku: 'HOME-002', description: 'Adjustable LED desk lamp with multiple brightness levels', quantity: 60, price: 34.99, category_id: 3, supplier_id: 3, low_stock_threshold: 15 },
      { name: 'Storage Organizer Bins', sku: 'HOME-003', description: 'Set of 6 storage bins with lids', quantity: 5, price: 24.99, category_id: 3, supplier_id: 3, low_stock_threshold: 20 },
      { name: 'Yoga Mat Premium', sku: 'SPRT-001', description: 'Non-slip yoga mat, 6mm thickness', quantity: 80, price: 39.99, category_id: 4, supplier_id: 4, low_stock_threshold: 20 },
      { name: 'Tennis Racket Pro', sku: 'SPRT-002', description: 'Professional grade tennis racket', quantity: 30, price: 149.99, category_id: 4, supplier_id: 4, low_stock_threshold: 10 },
      { name: 'Camping Tent 4-Person', sku: 'SPRT-003', description: 'Waterproof 4-person camping tent', quantity: 12, price: 199.99, category_id: 4, supplier_id: 4, low_stock_threshold: 5 },
      { name: 'Basketball Official Size', sku: 'SPRT-004', description: 'Official size basketball', quantity: 45, price: 29.99, category_id: 4, supplier_id: 4, low_stock_threshold: 15 },
      { name: 'Programming Guide Book', sku: 'BOOK-001', description: 'Complete guide to modern programming', quantity: 100, price: 44.99, category_id: 5, supplier_id: 5, low_stock_threshold: 25 },
      { name: 'Novel: The Great Adventure', sku: 'BOOK-002', description: 'Bestselling fiction novel', quantity: 200, price: 14.99, category_id: 5, supplier_id: 5, low_stock_threshold: 50 },
      { name: 'Building Blocks Set 500pc', sku: 'TOYS-001', description: '500-piece building blocks for kids', quantity: 35, price: 29.99, category_id: 6, supplier_id: 8, low_stock_threshold: 10 },
      { name: 'Board Game: Strategy Kings', sku: 'TOYS-002', description: 'Strategy board game for 2-4 players', quantity: 25, price: 34.99, category_id: 6, supplier_id: 8, low_stock_threshold: 8 },
      { name: 'Vitamin C Supplements 1000mg', sku: 'HLTH-001', description: '1000mg Vitamin C, 180 tablets', quantity: 120, price: 19.99, category_id: 7, supplier_id: 6, low_stock_threshold: 30 },
      { name: 'Organic Shampoo 500ml', sku: 'HLTH-002', description: 'Natural organic shampoo', quantity: 65, price: 12.99, category_id: 7, supplier_id: 6, low_stock_threshold: 20 },
      { name: 'Protein Powder Vanilla', sku: 'HLTH-003', description: 'Whey protein powder, 2lb', quantity: 3, price: 49.99, category_id: 7, supplier_id: 6, low_stock_threshold: 10 },
      { name: 'Printer Paper A4 500 Sheets', sku: 'OFFC-001', description: 'High-quality A4 printer paper', quantity: 250, price: 8.99, category_id: 8, supplier_id: 7, low_stock_threshold: 50 },
      { name: 'Ballpoint Pens Pack of 50', sku: 'OFFC-002', description: 'Assorted color ballpoint pens', quantity: 180, price: 12.99, category_id: 8, supplier_id: 7, low_stock_threshold: 40 },
      { name: 'Stapler Heavy Duty', sku: 'OFFC-003', description: 'Heavy duty stapler with 1000 staples', quantity: 40, price: 24.99, category_id: 8, supplier_id: 7, low_stock_threshold: 15 }
    ];
    
    for (const item of items) {
      try {
        await connection.execute(
          'INSERT INTO inventory_items (name, sku, description, quantity, price, category_id, supplier_id, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [item.name, item.sku, item.description, item.quantity, item.price, item.category_id, item.supplier_id, item.low_stock_threshold]
        );
        console.log(`[SEED] Inserted item: ${item.name}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`[SEED] Item already exists: ${item.sku}`);
        } else {
          console.error(`[SEED] Error inserting item ${item.sku}:`, err.message);
        }
      }
    }
    
    // Insert sample users (password is 'password123' hashed)
    console.log('\n[SEED] Inserting users...');
    const users = [
      { name: 'Admin User', email: 'admin@example.com', password: '$2a$10$xGJ9QK1pLz2J5j3F5uGV8eU5YxZ1N2L5mP8K9L0r1Q2s3t4u5v6w7x8y', role: 'admin' },
      { name: 'Manager User', email: 'manager@example.com', password: '$2a$10$xGJ9QK1pLz2J5j3F5uGV8eU5YxZ1N2L5mP8K9L0r1Q2s3t4u5v6w7x8y', role: 'manager' },
      { name: 'Staff User', email: 'staff@example.com', password: '$2a$10$xGJ9QK1pLz2J5j3F5uGV8eU5YxZ1N2L5mP8K9L0r1Q2s3t4u5v6w7x8y', role: 'staff' }
    ];
    
    for (const user of users) {
      try {
        await connection.execute(
          'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
          [user.name, user.email, user.password, user.role, true]
        );
        console.log(`[SEED] Inserted user: ${user.email}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`[SEED] User already exists: ${user.email}`);
        } else {
          console.error(`[SEED] Error inserting user ${user.email}:`, err.message);
        }
      }
    }
    
    console.log('\n[SEED] Seeding completed successfully!');
    
    // Verify data
    console.log('\n[SEED] Verifying data...');
    const [categoriesCount] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    console.log(`[SEED] Categories: ${categoriesCount[0].count}`);
    
    const [suppliersCount] = await connection.execute('SELECT COUNT(*) as count FROM suppliers');
    console.log(`[SEED] Suppliers: ${suppliersCount[0].count}`);
    
    const [itemsCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory_items');
    console.log(`[SEED] Inventory Items: ${itemsCount[0].count}`);
    
    const [usersCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`[SEED] Users: ${usersCount[0].count}`);
    
    // Insert sample orders with order items
    console.log('\n[SEED] Inserting orders...');
    const orders = [
      { 
        order_number: 'PO-2024-001', 
        order_type: 'purchase', 
        supplier_id: 1, 
        status: 'completed', 
        notes: 'Bulk electronics order',
        created_by: 1
      },
      { 
        order_number: 'PO-2024-002', 
        order_type: 'purchase', 
        supplier_id: 2, 
        status: 'pending', 
        notes: 'Clothing restock order',
        created_by: 1
      },
      { 
        order_number: 'SO-2024-001', 
        order_type: 'sale', 
        supplier_id: null, 
        status: 'completed', 
        notes: 'Customer order - electronics',
        created_by: 1
      },
      { 
        order_number: 'PO-2024-003', 
        order_type: 'purchase', 
        supplier_id: 3, 
        status: 'processing', 
        notes: 'Home & garden supplies',
        created_by: 2
      },
      { 
        order_number: 'SO-2024-002', 
        order_type: 'sale', 
        supplier_id: null, 
        status: 'pending', 
        notes: 'Customer order - clothing',
        created_by: 1
      },
      { 
        order_number: 'PO-2024-004', 
        order_type: 'purchase', 
        supplier_id: 4, 
        status: 'completed', 
        notes: 'Sports equipment order',
        created_by: 2
      },
      { 
        order_number: 'PO-2024-005', 
        order_type: 'purchase', 
        supplier_id: 5, 
        status: 'cancelled', 
        notes: 'Books order - cancelled due to delay',
        created_by: 1
      },
      { 
        order_number: 'SO-2024-003', 
        order_type: 'sale', 
        supplier_id: null, 
        status: 'completed', 
        notes: 'Customer order - health products',
        created_by: 1
      }
    ];
    
    const orderItemSets = [
      // Order 1 - PO-2024-001 (purchase, completed)
      [
        { item_id: 1, quantity: 20, unit_price: 75.00 },
        { item_id: 2, quantity: 10, unit_price: 280.00 },
        { item_id: 3, quantity: 100, unit_price: 8.50 }
      ],
      // Order 2 - PO-2024-002 (purchase, pending)
      [
        { item_id: 5, quantity: 50, unit_price: 18.00 },
        { item_id: 6, quantity: 25, unit_price: 85.00 },
        { item_id: 7, quantity: 30, unit_price: 45.00 }
      ],
      // Order 3 - SO-2024-001 (sale, completed)
      [
        { item_id: 1, quantity: 5, unit_price: 79.99 },
        { item_id: 4, quantity: 3, unit_price: 29.99 }
      ],
      // Order 4 - PO-2024-003 (purchase, processing)
      [
        { item_id: 9, quantity: 15, unit_price: 55.00 },
        { item_id: 10, quantity: 20, unit_price: 32.00 },
        { item_id: 11, quantity: 10, unit_price: 22.00 }
      ],
      // Order 5 - SO-2024-002 (sale, pending)
      [
        { item_id: 5, quantity: 10, unit_price: 19.99 },
        { item_id: 6, quantity: 5, unit_price: 89.99 }
      ],
      // Order 6 - PO-2024-004 (purchase, completed)
      [
        { item_id: 12, quantity: 30, unit_price: 35.00 },
        { item_id: 13, quantity: 15, unit_price: 140.00 },
        { item_id: 14, quantity: 20, unit_price: 28.00 }
      ],
      // Order 7 - PO-2024-005 (purchase, cancelled) - no items
      [],
      // Order 8 - SO-2024-003 (sale, completed)
      [
        { item_id: 20, quantity: 25, unit_price: 19.99 },
        { item_id: 21, quantity: 15, unit_price: 12.99 }
      ]
    ];
    
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const items = orderItemSets[i];
      
      try {
        // Calculate total amount
        let totalAmount = 0;
        for (const item of items) {
          totalAmount += item.quantity * item.unit_price;
        }
        
        const [orderResult] = await connection.execute(
          'INSERT INTO orders (order_number, order_type, supplier_id, status, notes, total_amount, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [order.order_number, order.order_type, order.supplier_id, order.status, order.notes, totalAmount, order.created_by]
        );
        
        const orderId = orderResult.insertId;
        console.log(`[SEED] Inserted order: ${order.order_number} (ID: ${orderId})`);
        
        // Insert order items
        for (const item of items) {
          const itemTotalPrice = item.quantity * item.unit_price;
          await connection.execute(
            'INSERT INTO order_items (order_id, item_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
            [orderId, item.item_id, item.quantity, item.unit_price, itemTotalPrice]
          );
          console.log(`[SEED] Added item to order: Item ${item.item_id} x ${item.quantity}`);
        }
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`[SEED] Order already exists: ${order.order_number}`);
        } else {
          console.error(`[SEED] Error inserting order ${order.order_number}:`, err.message);
        }
      }
    }
    
    // Verify orders
    console.log('\n[SEED] Verifying orders data...');
    const [ordersCount] = await connection.execute('SELECT COUNT(*) as count FROM orders');
    console.log(`[SEED] Orders: ${ordersCount[0].count}`);
    
    const [orderItemsCount] = await connection.execute('SELECT COUNT(*) as count FROM order_items');
    console.log(`[SEED] Order Items: ${orderItemsCount[0].count}`);
    
  } catch (err) {
    console.error('[SEED] Error:', err.message);
  } finally {
    await connection.end();
  }
}

seed();