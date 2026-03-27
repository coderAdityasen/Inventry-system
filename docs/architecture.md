# System Architecture Documentation

## Overview
This document describes the architecture of the Inventory Management System, including the technology stack, project structure, and implementation patterns.

---

## Technology Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** MySQL (via mysql2/promise)
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, CORS, Cookie Parser

### Frontend
- **Framework:** React 18+
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios

---

## Project Structure

```
inventory-management-system/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection & schema initialization
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.js
│   │   ├── inventoryController.js
│   │   ├── categoryController.js
│   │   └── supplierController.js
│   ├── middleware/            # Express middleware
│   │   ├── auth.js           # JWT verification
│   │   └── role.js           # Role-based access control
│   ├── models/               # Database models
│   │   ├── user.model.js
│   │   ├── InventoryItem.js
│   │   ├── Category.js
│   │   └── Supplier.js
│   ├── routes/               # API route definitions
│   │   ├── auth.routes.js
│   │   ├── inventoryRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── supplierRoutes.js
│   ├── services/             # Business logic layer
│   │   ├── auth.service.js
│   │   ├── inventoryService.js
│   │   ├── categoryService.js (future)
│   │   └── supplierService.js
│   └── src/
│       └── index.js          # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   │   ├── Button.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/          # React context providers
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── useAuth.js
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── inventory/
│   │   │   │   ├── InventoryList.jsx
│   │   │   │   ├── InventoryForm.jsx
│   │   │   │   └── InventoryDetails.jsx
│   │   │   ├── suppliers/
│   │   │   │   ├── SupplierList.jsx
│   │   │   │   ├── SupplierForm.jsx
│   │   │   │   └── SupplierDetails.jsx
│   │   │   └── categories/
│   │   │       ├── CategoryList.jsx
│   │   │       ├── CategoryForm.jsx
│   │   │       └── CategoryDetails.jsx
│   │   ├── services/         # API service layer
│   │   │   ├── api.js        # Axios instance with interceptors
│   │   │   ├── inventoryAPI.js
│   │   │   └── supplierAPI.js
│   │   ├── App.jsx           # Root component with routing
│   │   └── main.jsx          # Entry point
│   └── index.html
│
├── docs/                     # Documentation
│   ├── api-documentation.md
│   ├── coding-standards.md
│   ├── environment-setup.md
│   ├── git-workflow.md
│   ├── inventory-modules-breakdown.md
│   └── project-structure.md
│
└── docker/                   # Docker configuration
    ├── Dockerfile.backend
    ├── Dockerfile.frontend
    └── nginx.conf
```

---

## Layer Architecture

### Backend (MVC Pattern)

```
┌─────────────────────────────────────────────────┐
│                  ROUTES                         │
│  Defines endpoints and maps to controllers     │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│               CONTROLLERS                       │
│  Handle HTTP requests, validate input          │
│  Return JSON responses                         │
│  Console: [CONTROLLER] prefix                  │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                 SERVICES                        │
│  Business logic, validation, error handling   │
│  Console: [SERVICE] prefix                      │
│  Error codes: MODULE_XXX format                 │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                  MODELS                         │
│  Database operations (CRUD)                   │
│  Console: [MODEL] prefix                        │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                 DATABASE                        │
│  MySQL - stores all application data           │
└─────────────────────────────────────────────────┘
```

### Frontend (Component-Based)

```
┌─────────────────────────────────────────────────┐
│                   PAGES                         │
│  Route-level components (Dashboard, Lists)     │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│               COMPONENTS                        │
│  Reusable UI (Button, ProtectedRoute)          │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│               API SERVICES                      │
│  HTTP client wrapper with console logging     │
│  Console: [API] prefix                         │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                CONTEXT/HOOKS                    │
│  AuthContext - global auth state               │
│  useAuth - hook for auth operations            │
└─────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌──────────┐     POST /api/auth/login     ┌─────────────┐
│  Client  │ ──────────────────────────▶  │   Backend   │
└──────────┘                               └──────┬──────┘
     │                                          │
     │        JWT + Refresh Token               │
     │◀─────────────────────────────────────────┘
     │
     ▼
┌──────────┐     Authorization: Bearer <token> ┌─────────────┐
│  Client  │ ─────────────────────────────────▶ │   Backend   │
└──────────┘                                     └──────┬──────┘
                                                      │
                                                      ▼
                                              ┌─────────────┐
                                              │ Verify JWT  │
                                              │ Check Role  │
                                              └──────┬──────┘
                                                     │
                                                     ▼
                                              ┌─────────────┐
                                              │ Return Data │
                                              └─────────────┘
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Inventory Items Table
```sql
CREATE TABLE inventory_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  quantity INT DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  category_id INT,
  supplier_id INT,
  low_stock_threshold INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Suppliers Table
```sql
CREATE TABLE suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Role-Based Access Control (RBAC)

| Role    | Items | Categories | Suppliers | Users | Reports |
|---------|-------|------------|-----------|-------|---------|
| Admin   | CRUD  | CRUD       | CRUD      | CRUD  | Access  |
| Manager | CRUD  | CRUD       | CRUD      | Read  | Access  |
| Staff   | Read  | Read       | Read      | -     | -       |

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "MODULE_XXX",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## Console Logging Conventions

### Backend
- `[MODEL]` - Database queries and operations
- `[SERVICE]` - Business logic execution
- `[CONTROLLER]` - Request handling

### Frontend
- `[API]` - HTTP requests and responses
- `[Component]` - React component lifecycle

### Example Output
```
[CONTROLLER] createSupplier - Request body: { name: "ABC Corp", ... }
[SERVICE] createSupplier - Checking if email exists: abc@example.com
[MODEL] findByEmail - Searching for email: abc@example.com
[MODEL] findByEmail - Found rows: 0
[SERVICE] createSupplier - Created supplier ID: 1
[CONTROLLER] createSupplier - Sending response: { statusCode: 201, ... }
```

---

## Error Codes

| Code | Description |
|------|-------------|
| AUTH_001 | Invalid credentials |
| AUTH_002 | Token expired |
| AUTH_003 | Access denied |
| ITEM_001 | Validation error |
| ITEM_004 | Item not found |
| CATEGORY_001 | Validation error |
| CATEGORY_004 | Category not found |
| SUPPLIER_001 | Validation error |
| SUPPLIER_002 | Duplicate email |
| SUPPLIER_004 | Supplier not found |
| SUPPLIER_007 | Insufficient permissions |
| SERVER_500 | Internal server error |

---

## Next Steps for Implementation

1. **Test Existing APIs** - Verify supplier and category CRUD
2. **Order Module** - Create purchase/sales order management
3. **Stock Alerts** - Automatic low stock notifications
4. **Reports** - Analytics and dashboard charts
5. **User Management** - Admin panel for user control