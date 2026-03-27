# Inventory Management System - Technical Documentation

## Overview

This document provides a comprehensive technical explanation of the inventory management system, including architecture, data flow, API endpoints, and implementation details.

---

## Architecture

The system follows a **3-tier architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │  Dashboard  │ │InventoryList│ │  InventoryForm      │   │
│  │             │ │             │ │  (Add/Edit)         │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
│                           │                                  │
│                    inventoryAPI.js                          │
│                    (axios service)                          │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js/Express)               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │  Routes     │ │Controllers │ │  Services           │   │
│  │  (Express)  │ │            │ │  (Business Logic)   │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
│                           │                                  │
│                    inventoryService.js                      │
│                    (validation, authorization)             │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │Inventory   │ │ Categories  │ │  Suppliers          │   │
│  │Items       │ │             │ │                     │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Implementation

### 1. Database Models

#### InventoryItem Model (`backend/models/InventoryItem.js`)

The `InventoryItem` model handles all database operations for inventory items:

```
findAll(options)           → Get paginated list with filters
findById(id)              → Get single item by ID
findBySku(sku, excludeId) → Check SKU uniqueness
create(itemData)         → Insert new item
update(id, itemData)      → Update existing item
delete(id)                → Delete item (must have zero stock)
getLowStock(threshold)    → Get items below threshold
categoryExists(id)        → Validate category reference
supplierExists(id)        → Validate supplier reference
```

**Database Table Structure:**
```sql
inventory_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  quantity INT DEFAULT 0,
  price DECIMAL(10, 2) DEFAULT 0,
  category_id INT (FK → categories.id),
  supplier_id INT (FK → suppliers.id),
  low_stock_threshold INT DEFAULT 10,
  image_url VARCHAR(500),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Category Model (`backend/models/Category.js`)

```
findAll()                 → Get all categories
findById(id)              → Get category by ID
create(categoryData)      → Create new category
update(id, categoryData)  → Update category
delete(id)                → Delete category
```

#### Supplier Model (`backend/models/Supplier.js`)

```
findAll()                 → Get all suppliers
findById(id)              → Get supplier by ID
create(supplierData)      → Create new supplier
update(id, supplierData)  → Update supplier
delete(id)                → Delete supplier
```

---

### 2. Controllers

Controllers handle HTTP requests and responses. They receive requests, call the appropriate service methods, and format the response.

#### InventoryController (`backend/controllers/inventoryController.js`)

```javascript
// GET /api/v1/items - Get all items with pagination
getAllItems(req, res) → {
  query: { page, limit, search, category, supplier, sortBy, sortOrder }
  response: { success, data: { items: [], pagination: {} } }
}

// GET /api/v1/items/:id - Get single item
getItemById(req, res) → {
  params: { id }
  response: { success, data: { item } }
}

// POST /api/v1/items - Create new item (admin/manager)
createItem(req, res) → {
  body: { name, sku, description, quantity, price, category_id, supplier_id, ... }
  response: { success, message, data: { id } }
}

// PUT /api/v1/items/:id - Update item (admin/manager)
updateItem(req, res) → {
  params: { id }, body: { ... }
  response: { success, message, data: { id, updated_at } }
}

// DELETE /api/v1/items/:id - Delete item (admin only)
deleteItem(req, res) → {
  params: { id }
  response: { success, message }
}
```

#### CategoryController (`backend/controllers/categoryController.js`)

```
GET    /api/v1/categories      → Get all categories
GET    /api/v1/categories/:id   → Get category by ID
POST   /api/v1/categories      → Create category (admin/manager)
PUT    /api/v1/categories/:id  → Update category (admin/manager)
DELETE /api/v1/categories/:id  → Delete category (admin only)
```

#### SupplierController (`backend/controllers/supplierController.js`)

```
GET    /api/v1/suppliers      → Get all suppliers
GET    /api/v1/suppliers/:id  → Get supplier by ID
POST   /api/v1/suppliers      → Create supplier (admin/manager)
PUT    /api/v1/suppliers/:id  → Update supplier (admin/manager)
DELETE /api/v1/suppliers/:id  → Delete supplier (admin only)
```

---

### 3. Services

Services contain business logic and validation. They are called by controllers and interact with database models.

#### InventoryService (`backend/services/inventoryService.js`)

**Key Functions:**

```javascript
// Validate input data
sanitizeItemData(itemData) → Converts undefined to null

// Create new item
createItem(itemData, userRole) → {
  1. Validate required fields (name, sku)
  2. Check user role (admin/manager)
  3. Validate quantity/price >= 0
  4. Check SKU uniqueness
  5. Validate category_id exists
  6. Validate supplier_id exists
  7. Insert into database
  8. Return success
}

// Update item
updateItem(id, itemData, userRole) → {
  1. Validate ID
  2. Check user role
  3. Check item exists
  4. Validate quantity/price >= 0
  5. Check SKU uniqueness (if changing)
  6. Validate category_id exists
  7. Validate supplier_id exists
  8. Update database
  9. Return success
}

// Delete item
deleteItem(id, userRole) → {
  1. Validate ID
  2. Check user role is admin
  3. Check item exists
  4. Check quantity is 0 (cannot delete items with stock)
  5. Delete from database
  6. Return success
}
```

---

### 4. Routes

Routes define the API endpoints and apply middleware for authentication and authorization.

#### Inventory Routes (`backend/routes/inventoryRoutes.js`)

```javascript
// All routes require authentication via verifyToken middleware
router.use(verifyToken);

// Public read operations
GET    /api/v1/items           → getAllItems
GET    /api/v1/items/:id       → getItemById
GET    /api/v1/items/low-stock → getLowStock
GET    /api/v1/items/search    → searchItems

// Protected operations (admin/manager)
POST   /api/v1/items           → createItem (role: admin, manager)
PUT    /api/v1/items/:id       → updateItem (role: admin, manager)

// Protected operations (admin only)
DELETE /api/v1/items/:id       → deleteItem (role: admin)
```

---

### 5. Middleware

#### Auth Middleware (`backend/middleware/auth.js`)

```javascript
verifyToken(req, res, next) → {
  1. Get token from Authorization header (Bearer token)
  2. Verify JWT token using JWT_SECRET
  3. Decode user info (id, email, role)
  4. Attach user to req.user
  5. Call next() to proceed
}
```

#### Role Middleware (`backend/middleware/role.js`)

```javascript
checkRole(allowedRoles)(req, res, next) → {
  1. Check if req.user exists (verified by auth middleware)
  2. Check if user role is in allowedRoles array
  3. If authorized, call next()
  4. If not authorized, return 403 error
}
```

---

### 6. Error Handling

Each layer has error handling with detailed debugging:

```javascript
// Service layer - creates structured errors
createError(message, errorCode, statusCode, debug) → {
  message: 'Human readable message',
  errorCode: 'ITEM_001',      // For frontend handling
  statusCode: 400,            // HTTP status
  debug: { ... }             // Development details
}

// Controller layer - handles errors
handleServiceError(error, res, operation) → {
  1. Log error with operation name
  2. Extract statusCode and errorCode
  3. Format response JSON
  4. Add debug info in development
  5. Send error response
}
```

---

## Frontend Implementation

### 1. API Service (`frontend/src/services/inventoryAPI.js`)

The inventoryAPI provides methods for all CRUD operations:

```javascript
// GET /api/v1/items
getAll(params) → Fetches paginated inventory items

// GET /api/v1/items/:id
getById(id) → Fetches single item details

// POST /api/v1/items
create(itemData) → Creates new inventory item

// PUT /api/v1/items/:id
update(id, itemData) → Updates existing item

// DELETE /api/v1/items/:id
delete(id) → Deletes item

// GET /api/v1/categories
getAllCategories() → Fetches all categories for dropdown

// GET /api/v1/suppliers
getAllSuppliers() → Fetches all suppliers for dropdown
```

### 2. Pages

#### InventoryList (`frontend/src/pages/inventory/InventoryList.jsx`)

**Features:**
- Displays paginated inventory items in a table
- Search bar with debounced search (300ms)
- Sort by name, quantity, price, date
- Sort order ascending/descending
- Edit/Delete buttons (role-based)
- Delete confirmation modal

**Data Flow:**
```
1. Component mounts → fetchItems()
2. fetchItems() → inventoryAPI.getAll(params)
3. API returns → setItems(), setPagination()
4. Display table with items
```

#### InventoryForm (`frontend/src/pages/inventory/InventoryForm.jsx`)

**Features:**
- Add new item mode
- Edit existing item mode
- Form validation (name, SKU required)
- Category dropdown (loaded from API)
- Supplier dropdown (loaded from API)
- Number inputs with validation

**Data Flow:**
```
1. Component mounts (edit mode) → inventoryAPI.getById(id)
2. Fetch categories/suppliers → inventoryAPI.getAllCategories/Suppliers
3. User fills form → setFormData()
4. Submit → validate() → inventoryAPI.create/update()
5. Success → navigate('/inventory')
```

---

## Data Flow Diagrams

### 1. Create Item Flow

```
User fills form
     │
     ▼
InventoryForm.jsx
     │
     ▼
inventoryAPI.create(formData)
     │
     ▼
axios.post('/api/v1/items', formData)
     │
     ▼
API Service (adds auth header)
     │
     ▼
Backend Routes
     │
     ▼
inventoryController.createItem()
     │
     ▼
verifyToken middleware (checks JWT)
     │
     ▼
checkRole middleware (checks admin/manager)
     │
     ▼
inventoryService.createItem()
     │
     ├──► Validate required fields
     ├──► Check SKU uniqueness
     ├──► Validate category_id exists
     ├──► Validate supplier_id exists
     │
     ▼
InventoryItemModel.create()
     │
     ▼
Database INSERT
     │
     ▼
Response ← Service ← Controller ← API
     │
     ▼
Frontend handles response
     │ Success → navigate('/inventory')
     │ Error   → show error message
```

### 2. View Inventory Flow

```
User clicks "Inventory" in Dashboard
     │
     ▼
InventoryList.jsx mounts
     │
     ▼
useEffect() → fetchItems()
     │
     ▼
inventoryAPI.getAll({ page, limit, search })
     │
     ▼
GET /api/v1/items?page=1&limit=10
     │
     ▼
Backend verifies token (read-only, no role check)
     │
     ▼
inventoryService.getAllItems()
     │
     ▼
InventoryItemModel.findAll()
     │
     ▼
Database SELECT with pagination
     │
     ▼
Response with items[] and pagination{}
     │
     ▼
Display table with items
```

---

## Role-Based Access Control

| Operation | Admin | Manager | Staff |
|-----------|-------|---------|-------|
| View items | ✓ | ✓ | ✓ |
| Search items | ✓ | ✓ | ✓ |
| View low stock | ✓ | ✓ | ✓ |
| Create item | ✓ | ✓ | ✗ |
| Update item | ✓ | ✓ | ✗ |
| Delete item | ✓ | ✗ | ✗ |
| Manage categories | ✓ | ✓ | ✗ |
| Manage suppliers | ✓ | ✓ | ✗ |

---

## Debug Logging

The system includes comprehensive console logging for debugging:

### Frontend Logs (in browser console)

```
[API] getAll - Request params: { page: 1, limit: 10, search: "" }
[API] getAll - Response success: true

[API] create - Request data: { name: "Test", sku: "SKU-001", ... }
[API] create - Response success: true

[API] update - Error: { status: 403, data: { message: "Insufficient permissions" } }
```

### Backend Logs (in terminal)

```
[CONTROLLER] createItem - Request body: { name: "Test", sku: "SKU-001", ... }
[CONTROLLER] createItem - User role: "manager"
[SERVICE] createItem - Sanitized data: { name: "Test", sku: "SKU-001", ... }
[SERVICE] createItem - Created item ID: 5
[CONTROLLER] createItem - Result success: true
```

---

## Error Codes

| Error Code | Status | Description |
|------------|--------|-------------|
| ITEM_001 | 400 | Validation failed (missing/invalid fields) |
| ITEM_002 | 400 | SKU already exists |
| ITEM_003 | 400 | Quantity cannot be negative |
| ITEM_004 | 404 | Item not found |
| ITEM_005 | 400 | Category not found |
| ITEM_006 | 400 | Supplier not found |
| ITEM_007 | 403 | Insufficient permissions |
| ITEM_008 | 400 | Price cannot be negative |
| ITEM_010 | 409 | Cannot delete item with remaining stock |
| ITEM_500 | 500 | Internal server error |

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "id": 5,
    "name": "Product Name",
    "sku": "SKU-001"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Insufficient permissions to create item",
  "errorCode": "ITEM_007",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "debug": {
    "userRole": "staff",
    "requiredRole": "admin or manager"
  }
}
```

---

## Database Relationships

```
┌──────────────┐       ┌─────────────────┐       ┌─────────────┐
│  categories  │       │  inventory_items │       │  suppliers  │
├──────────────┤       ├─────────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ category_id (FK) │       │ id (PK)     │
│ name        │       │ id (PK)         │───────│ supplier_id │
│ description │       │ name            │       │ name        │
│ created_at  │       │ sku             │       │ email       │
│ updated_at  │       │ quantity        │       │ phone       │
└──────────────┘       │ price           │       │ address     │
                       │ supplier_id (FK)│       └─────────────┘
                       └─────────────────┘
```

---

## Testing Checklist

### Manual Testing

1. **Authentication**
   - [ ] Login with valid credentials
   - [ ] Login with invalid credentials
   - [ ] Access protected route without token

2. **Inventory List**
   - [ ] View all items
   - [ ] Search by name/SKU
   - [ ] Sort by different columns
   - [ ] Pagination works

3. **Add Item**
   - [ ] Form validation works
   - [ ] Category dropdown populated
   - [ ] Supplier dropdown populated
   - [ ] Create with admin account
   - [ ] Create with manager account
   - [ ] Create with staff account (should fail)

4. **Edit Item**
   - [ ] Load item data
   - [ ] Update with admin account
   - [ ] Update with manager account
   - [ ] Update with staff account (should fail)

5. **Delete Item**
   - [ ] Delete with admin account
   - [ ] Delete with manager account (should fail)
   - [ ] Cannot delete item with stock

6. **Categories/Suppliers**
   - [ ] View category list
   - [ ] View supplier list
   - [ ] Add category (admin/manager)
   - [ ] Add supplier (admin/manager)

---

## Future Enhancements

1. **Stock Movements** - Track all inventory changes (purchases, sales, adjustments)
2. **Low Stock Alerts** - Automatic notifications when items fall below threshold
3. **Reports** - Generate inventory reports, analytics, and visualizations
4. **Image Upload** - Support for product image uploads
5. **Barcode/SKU Generation** - Auto-generate unique SKUs
6. **Batch Operations** - Bulk import/export
7. **Audit Log** - Track all changes for compliance
8. **Multi-warehouse** - Support for multiple warehouse locations
