# Environment Setup

This document covers the setup process for local development and production environments.

## Prerequisites

### Required Software

- **Node.js** (v18 or higher)
- **Docker** (latest version)
- **Docker Compose** (v2 or higher)
- **Git** (latest version)
- **MySQL** (v8.0) - for local development without Docker

### Recommended Tools

- **VS Code** - Code editor
- **MySQL Workbench** - Database GUI
- **Postman** - API testing

## Local Development Setup

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd inventory-management-system

# Start development environment
npm run dev

# Or build and start
npm run dev:build
```

This will start:
- Frontend at http://localhost:5173
- Backend at http://localhost:5000
- MySQL at localhost:3306

### Option 2: Local Development

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

#### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## Environment Variables

### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=inventory_db

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug
```

### Frontend (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Inventory Management System
VITE_ENVIRONMENT=development
```

## Production Setup

### Docker Production Build

```bash
# Build production images
npm run prod:build

# Start production environment
npm run prod
```

### Manual Production Setup

#### Backend

```bash
cd backend

# Install production dependencies
npm install --production

# Set environment
export NODE_ENV=production

# Start server
npm start
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with Nginx or other web server
```

## Database Setup

### MySQL Database Initialization

```sql
-- Create database
CREATE DATABASE inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'inventory_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON inventory_db.* TO 'inventory_user'@'localhost';
FLUSH PRIVILEGES;

-- Create tables
CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INT DEFAULT 0,
  category_id INT,
  supplier_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

#### Docker Issues

```bash
# Remove all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild
docker-compose up --build
```

#### Node Modules Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules

# Reinstall
npm install
```

#### Database Connection Issues

- Verify MySQL is running
- Check credentials in .env file
- Ensure database exists
- Check firewall settings

## Development Commands

### Available Scripts

```bash
# Development
npm run dev              # Start all services with Docker
npm run dev:build        # Build and start all services

# Production
npm run prod             # Start production with Docker
npm run prod:build       # Build production images

# Code Quality
npm run lint             # Run linting
npm run format           # Format code with Prettier
```

## Verification

### Check Services

```bash
# Backend health check
curl http://localhost:5000/health

# Frontend
curl http://localhost:5173
```

### Database Verification

```bash
# Connect to MySQL container
docker exec -it inventory-mysql mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE inventory_db;

# Show tables
SHOW TABLES;
```
