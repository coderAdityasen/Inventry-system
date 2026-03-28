const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'inventory-management-api'
  });
});

// Auth routes
app.use('/api/auth', require('../routes/auth.routes'));

// Inventory routes
app.use('/api/v1/items', require('../routes/inventoryRoutes'));

// Category routes
app.use('/api/v1/categories', require('../routes/categoryRoutes'));

// Supplier routes
app.use('/api/v1/suppliers', require('../routes/supplierRoutes'));

// Order routes
app.use('/api/v1/orders', require('../routes/orderRoutes'));

// Report routes
app.use('/api/v1/reports', require('../routes/reportRoutes'));

// Upload routes
app.use('/api/v1/upload', require('../routes/uploadRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle custom errors with error codes
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'SERVER_500';
  
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    errorCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };
  
  // Add debug info in development
  if (process.env.NODE_ENV === 'development') {
    response.debug = err.debug || {};
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
});

// Initialize database and start server
const { initDatabase } = require('../config/db');

const startServer = async () => {
  try {
    await initDatabase();
    console.log('Database initialized');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
