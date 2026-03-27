# Inventory Management System - Module Breakdown & Implementation Guide

Based on project analysis, here are the modules required for a complete working inventory system. Each module is defined with Context, Objective, Input, Constraints, and Output.

---

## 1. Authentication Module ✅ COMPLETED

**Context:** User authentication and authorization system  
**Objective:** Secure user login, registration, and session management with JWT tokens and role-based access control  
**Input:** User credentials (email, password), registration data (name, email, password, role)  
**Constraints:** 
- Password minimum 6 characters
- JWT tokens with 6h access token expiry, 7d refresh token expiry
- Roles: admin, manager, staff  
**Output:** 
- Access/refresh tokens
- User profile data
- Protected route access

**Implementation:**
- `backend/models/user.model.js` - User schema with roles
- `backend/services/auth.service.js` - JWT token management
- `backend/controllers/auth.controller.js` - Login/register handlers
- `backend/routes/auth.routes.js` - Auth API endpoints
- `frontend/src/context/AuthContext.jsx` - Auth state management
- `frontend/src/pages/Login.jsx`, `Register.jsx` - Auth UI

---

## 2. Items/Inventory Module ✅ COMPLETED

**Context:** Core inventory management - managing all products/items  
**Objective:** Full CRUD operations for inventory items with stock tracking, search, and filtering  
**Input:** Item data (name, description, quantity, price, category, supplier, SKU, image)  
**Constraints:**
- Quantity cannot be negative
- Unique SKU required
- Category and supplier must exist
- Role-based access (admin/manager: full CRUD, staff: read-only or limited edit)
**Output:** Item list with pagination, single item details, stock status, CRUD response

**Backend Implementation:**
- `backend/models/InventoryItem.js` - Database model with CRUD operations
- `backend/controllers/inventoryController.js` - Request handlers
- `backend/services/inventoryService.js` - Business logic
- `backend/routes/inventoryRoutes.js` - API routes

**Frontend Implementation:**
- `frontend/src/pages/inventory/InventoryList.jsx` - Main inventory view with search, filter, pagination
- `frontend/src/pages/inventory/InventoryForm.jsx` - Add/Edit item form with category/supplier dropdowns
- `frontend/src/pages/inventory/InventoryDetails.jsx` - Single item view

**API Endpoints:**
```
GET    /api/v1/items              - List items (with pagination, search, filters)
GET    /api/v1/items/:id          - Get single item
POST   /api/v1/items              - Create item (admin/manager)
PUT    /api/v1/items/:id         - Update item (admin/manager)
DELETE /api/v1/items/:id          - Delete item (admin only)
GET    /api/v1/items/low-stock   - Get low stock items
```

---

## 3. Categories Module ✅ COMPLETED

**Context:** Product categorization system  
**Objective:** Manage product categories with CRUD operations, linking to inventory items  
**Input:** Category name, description, parent category (optional), active status  
**Constraints:**
- Unique category name
- Cannot delete if linked to items
- Admin/manager only for modifications
**Output:** Category list, category details, CRUD response

**Backend Implementation:**
- `backend/models/Category.js` - Database model
- `backend/controllers/categoryController.js` - Request handlers
- `backend/routes/categoryRoutes.js` - API routes
- Console logging: `[MODEL]` prefix for all database operations
- Console logging: `[CONTROLLER]` prefix for all requests

**Frontend Implementation:**
- `frontend/src/pages/categories/CategoryList.jsx` - Category table with search, filter, pagination
- `frontend/src/pages/categories/CategoryForm.jsx` - Add/Edit category form
- `frontend/src/pages/categories/CategoryDetails.jsx` - Category view with linked items

**API Endpoints:**
```
GET    /api/v1/categories              - List all categories
GET    /api/v1/categories/:id          - Get single category
POST   /api/v1/categories              - Create category (admin/manager)
PUT    /api/v1/categories/:id         - Update category (admin/manager)
DELETE /api/v1/categories/:id         - Delete category (admin only)
```

**Database Schema:**
```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
)
```

---

## 4. Suppliers Module ✅ COMPLETED

**Context:** Supplier/vendor management  
**Objective:** Manage supplier information, contact details, and supplier-item relationships  
**Input:** Supplier name, contact person, email, phone, address, notes, active status  
**Constraints:**
- Unique email per supplier
- Cannot delete if linked to active items
- Admin/manager only for full CRUD
**Output:** Supplier list, supplier details, CRUD response

**Backend Implementation:**
- `backend/models/Supplier.js` - Database model with full CRUD
- `backend/controllers/supplierController.js` - Request handlers
- `backend/services/supplierService.js` - Business logic with validation
- `backend/routes/supplierRoutes.js` - API routes
- Console logging: `[MODEL]`, `[SERVICE]`, `[CONTROLLER]` prefixes
- Error codes: `SUPPLIER_001` (validation), `SUPPLIER_002` (duplicate), `SUPPLIER_004` (not found), `SUPPLIER_007` (permissions)

**Frontend Implementation:**
- `frontend/src/pages/suppliers/SupplierList.jsx` - Supplier table with search, filter, pagination
- `frontend/src/pages/suppliers/SupplierForm.jsx` - Add/Edit supplier form
- `frontend/src/pages/suppliers/SupplierDetails.jsx` - Supplier view with linked items
- `frontend/src/services/supplierAPI.js` - API service with `[API]` prefix logging

**API Endpoints:**
```
GET    /api/v1/suppliers              - List suppliers (with pagination, search, filters)
GET    /api/v1/suppliers/:id          - Get single supplier
GET    /api/v1/suppliers/:id/details  - Get supplier with item count
POST   /api/v1/suppliers              - Create supplier (admin/manager)
PUT    /api/v1/suppliers/:id          - Update supplier (admin/manager)
PATCH  /api/v1/suppliers/:id/status  - Toggle active status (admin/manager)
DELETE /api/v1/suppliers/:id         - Delete supplier (admin only)
```

**Database Schema:**
```sql
CREATE TABLE suppliers (
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
```

---

## 5. Dashboard Module ✅ COMPLETED (Updated)

**Context:** Main landing page after login  
**Objective:** Display key metrics, quick actions, and navigation to all modules  
**Input:** User context, role-based data  
**Constraints:**
- Role-specific widgets
- Quick navigation links
- Responsive design
**Output:** Dashboard widgets, quick stats, module navigation

**Implementation:**
- `frontend/src/pages/Dashboard.jsx` - Updated with:
  - User info card (name, email, role)
  - Quick action cards (Inventory, Suppliers, Categories)
  - Role-based access (Admin panel, Reports for manager)
  - Logout functionality
  - Navigation links to all modules

---

## 6. Order Management Module ✅ COMPLETED

**Context:**
Order management system when user click on order management that handles both purchase (incoming stock from suppliers) and sales (outgoing stock to customers), ensuring seamless integration with inventory, suppliers, and product modules while maintaining role-based access control (Admin, Manager, Staff).

**Objective:**
Handle the complete purchase and sales flow by enabling users to create and manage orders, track order status, automatically update inventory stock levels, and maintain a history of all transactions for auditing and reporting purposes.

**Inputs:**
Order Type (purchase/sale), list of products (each with product ID, quantity, price), supplier ID (required for purchase orders), order status (pending/completed/cancelled), and optional fields like notes or timestamps.

**Constraints:**
Must support adding multiple products in a single order; supplier is mandatory for purchase orders but not required for sales; stock must automatically increase for purchase orders and decrease for sales orders.

**Backend Implementation:**
- `backend/models/Order.js` - Database model with full CRUD and order item management
- `backend/controllers/orderController.js` - Request handlers
- `backend/services/orderService.js` - Business logic with inventory integration
- `backend/routes/orderRoutes.js` - API routes
- `backend/models/InventoryItem.js` - Added `updateQuantity` method for stock management
- Console logging: `[MODEL]`, `[SERVICE]`, `[CONTROLLER]` prefixes
- Error codes: `ORDER_001` (validation), `ORDER_004` (not found), `ORDER_007` (permissions), `ORDER_008` (invalid operation)

**Frontend Implementation:**
- `frontend/src/pages/orders/OrderList.jsx` - Order table with search, filter, pagination, status update
- `frontend/src/pages/orders/OrderForm.jsx` - Create order with dynamic item addition
- `frontend/src/pages/orders/OrderDetails.jsx` - Order view with items and status management
- `frontend/src/services/orderAPI.js` - API service with `[API]` prefix logging

**API Endpoints:**
```
GET    /api/v1/orders              - List orders (with pagination, search, filters)
GET    /api/v1/orders/:id          - Get single order with items
POST   /api/v1/orders              - Create order (admin/manager)
PUT    /api/v1/orders/:id          - Update order (admin/manager)
PATCH  /api/v1/orders/:id/status  - Update order status (admin/manager)
DELETE /api/v1/orders/:id         - Delete order (admin only)
```

**Database Schema:**
```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  order_type ENUM('purchase', 'sale') NOT NULL,
  supplier_id INT,
  status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

---
## 7. Reports & Analytics Module

Context:
Reporting and analytics system within the inventory application that aggregates data from inventory, orders, and suppliers to provide meaningful business insights, enabling Admin and Manager roles to monitor performance, track stock levels, and make data-driven decisions, while Staff users may have limited or view-only access.

Objective:
Provide system insights by generating real-time and historical reports on inventory and sales, highlighting key metrics such as current stock levels, sales performance, and low stock alerts, along with filtering capabilities to analyze data over specific date ranges.

Inputs:
Date range filters (start date, end date), report type (inventory, sales, low stock), optional filters like category, product, or supplier; inputs are provided via frontend UI controls (date pickers, dropdowns, search fields) and sent to backend APIs for processing.

Constraints:
Inventory report must reflect real-time stock data; sales report should be based on completed orders only; low stock alerts must trigger based on predefined reorder levels; ensure efficient querying for large datasets (use indexing, aggregation pipelines); role-based access control (Admin/Manager full access, Staff limited); ensure accurate calculations for totals (stock value, sales revenue); backend must validate date ranges and filter parameters.

Output:
Report APIs (e.g., /reports/inventory, /reports/sales, /reports/low-stock) built using Node.js and Express with secure authentication and optimized queries/aggregations; data responses including structured summaries (total stock, total sales, low stock items) and detailed lists; basic dashboard UI built with React and Tailwind displaying key metrics (cards for totals), tables for reports, and simple charts/graphs (e.g., sales over time, stock distribution), along with filtering options and real-time updates, ensuring clear visualization and actionable insights for users.


## 8. User Management Module 🔄 NOT STARTED

**Context:** Admin-level user administration  
**Objective:** Manage system users, roles, and permissions  
**Input:** User data (name, email, role), status changes, password reset  
**Constraints:**
- Admin only access
- Cannot delete own admin account
- Password requirements enforced
**Output:** User list, user details, CRUD response

**Backend Files to Create:**
- `backend/controllers/userController.js`
- `backend/services/userService.js`
- `backend/routes/userRoutes.js`

**Frontend Files to Create:**
- `frontend/src/pages/admin/UsersList.jsx`
- `frontend/src/pages/admin/UserForm.jsx`
- `frontend/src/pages/admin/UserDetails.jsx`

---

## 10. Search & Filter Module 🔄 NOT STARTED

**Context:** Global search and advanced filtering  
**Objective:** Quick search across items, categories, suppliers with advanced filters  
**Input:** Search query, filter parameters, sort options  
**Constraints:**
- Debounced search (300ms)
- Pagination for large results
- Full-text search capability
**Output:** Filtered results, filter options, search suggestions

**Backend Files to Create:**
- `backend/services/searchService.js`

**Frontend Components to Create:**
- `frontend/src/components/search/SearchBar.jsx`
- `frontend/src/components/filters/FilterPanel.jsx`

---

## Implementation Status Summary

| Module | Status | Backend Files | Frontend Files | Priority |
|--------|--------|---------------|----------------|----------|
| Authentication | ✅ Complete | 4 | 3 | P1 |
| Items/Inventory | ✅ Complete | 4 | 3 | P1 |
| Categories | ✅ Complete | 3 | 3 | P1 |
| Suppliers | ✅ Complete | 4 | 4 | P2 |
| Dashboard | ✅ Updated | 0 | 1 | P2 |
| Order Management | 🔄 Not Started | 4 | 3 | P2 |
| Stock Alerts | 🔄 Not Started | 4 | 2 | P3 |
| Reports/Analytics | 🔄 Not Started | 3 | 3 | P4 |
| User Management | 🔄 Not Started | 3 | 3 | P5 |
| Search & Filter | 🔄 Not Started | 1 | 2 | P3 |

---

## Console Logging Conventions

All modules implement consistent console logging for debugging:

**Backend:**
- `[MODEL]` - Database operations (queries, inserts, updates)
- `[SERVICE]` - Business logic and validation
- `[CONTROLLER]` - Request handling and responses

**Frontend:**
- `[API]` - API service calls (requests and responses)
- `[ComponentName]` - React component lifecycle events

**Error Handling:**
- Backend uses error codes (e.g., `SUPPLIER_001`, `CATEGORY_004`)
- Frontend displays user-friendly error messages
- Full error details logged to console for debugging

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Pages     │  │ Components  │  │   Context   │             │
│  │ - Dashboard │  │ - Button    │  │ - AuthContext│             │
│  │ - Inventory │  │ - Protected │  │              │             │
│  │ - Suppliers │  │   Route     │  │              │             │
│  │ - Categories│  │             │  │              │             │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘             │
│         │                │                                      │
│         └────────┬───────┘                                      │
│                  ▼                                              │
│         ┌────────────────┐                                     │
│         │   API Services │                                     │
│         │ - inventoryAPI │                                     │
│         │ - supplierAPI │                                     │
│         └────────┬───────┘                                     │
└──────────────────┼──────────────────────────────────────────────┘
                   │ HTTP Requests
┌──────────────────┼──────────────────────────────────────────────┐
│                  ▼           BACKEND                            │
│         ┌────────────────┐                                     │
│         │   Routes       │                                     │
│         │ - /api/v1/items│                                     │
│         │ - /api/v1/cat..│                                     │
│         │ - /api/v1/sup..│                                     │
│         └────────┬───────┘                                     │
│                  ▼                                              │
│         ┌────────────────┐                                     │
│         │  Controllers   │                                     │
│         │ - itemControl..│                                     │
│         │ - categoryCtrl..│                                    │
│         │ - supplierCtrl.│                                     │
│         └────────┬───────┘                                     │
│                  ▼                                              │
│         ┌────────────────┐                                     │
│         │   Services     │                                     │
│         │ - inventoryServ│                                     │
│         │ - categoryServ │                                     │
│         │ - supplierServ │                                     │
│         └────────┬───────┘                                     │
│                  ▼                                              │
│         ┌────────────────┐                                     │
│         │    Models     │                                     │
│         │ - InventoryItem│                                     │
│         │ - Category    │                                     │
│         │ - Supplier    │                                     │
│         └────────┬───────┘                                     │
│                  ▼                                              │
│         ┌────────────────┐                                     │
│         │  Database (MySQL)                                    │
│         │ - users, inventory_items,                            │
│         │   categories, suppliers                              │
│         └──────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Test Supplier API** - Verify all CRUD operations work after database schema fix
2. **Test Category API** - Ensure all category endpoints function correctly
3. **Implement Order Management** - Start with purchase orders
4. **Add Stock Alerts** - Automatic low stock notifications
5. **Build Reports** - Analytics and export functionality