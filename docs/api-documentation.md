# API Documentation - Inventory Management System

This document contains all API endpoints for the inventory management system with proper error handling documentation.

Base URL: `http://localhost:5000/api/v1`

---

## Authentication Module (Completed)

### Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /auth/register | Register new user | Public |
| POST | /auth/login | User login | Public |
| POST | /auth/logout | User logout | Protected |
| POST | /auth/refresh-token | Refresh access token | Public |
| GET | /auth/me | Get current user | Protected |

### Authentication Errors

| Error Code | HTTP Status | Error Type | Description | Resolution |
|------------|-------------|------------|-------------|-------------|
| AUTH_001 | 400 | VALIDATION_ERROR | Email and password are required | Provide both email and password |
| AUTH_002 | 400 | VALIDATION_ERROR | Invalid email format | Use valid email format (user@example.com) |
| AUTH_003 | 400 | VALIDATION_ERROR | Password must be at least 6 characters | Use password with 6+ characters |
| AUTH_004 | 400 | VALIDATION_ERROR | Invalid role. Must be admin, manager, or staff | Use valid role |
| AUTH_005 | 400 | DUPLICATE_ERROR | Email already registered | Use different email |
| AUTH_006 | 401 | AUTHENTICATION_ERROR | Invalid email or password | Check credentials |
| AUTH_007 | 403 | AUTHORIZATION_ERROR | Account is disabled | Contact administrator |
| AUTH_008 | 401 | TOKEN_ERROR | Invalid or expired token | Re-login or refresh token |
| AUTH_009 | 401 | TOKEN_ERROR | Refresh token required | Provide refresh token |
| AUTH_010 | 400 | TOKEN_ERROR | Invalid refresh token | Use valid refresh token |

### Request/Response Examples

#### POST /auth/register
```json
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "staff"
}

// Success Response (201)
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "staff"
    }
  }
}

// Error Response
{
  "success": false,
  "message": "Email already registered",
  "errorCode": "AUTH_005",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### POST /auth/login
```json
// Request
{
  "email": "john@example.com",
  "password": "password123"
}

// Success Response (200)
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "staff" },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}

// Error Response
{
  "success": false,
  "message": "Invalid email or password",
  "errorCode": "AUTH_006",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Items/Inventory Module

### Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /items | Get all items (paginated) | Protected |
| GET | /items/:id | Get single item by ID | Protected |
| POST | /items | Create new item | Admin/Manager |
| PUT | /items/:id | Update item | Admin/Manager |
| DELETE | /items/:id | Delete item | Admin only |
| GET | /items/search | Search items | Protected |
| GET | /items/low-stock | Get low stock items | Protected |

### Item Errors

| Error Code | HTTP Status | Error Type | Description | Resolution |
|------------|-------------|------------|-------------|-------------|
| ITEM_001 | 400 | VALIDATION_ERROR | Item name is required | Provide item name |
| ITEM_002 | 400 | VALIDATION_ERROR | SKU already exists | Use unique SKU |
| ITEM_003 | 400 | VALIDATION_ERROR | Quantity cannot be negative | Use non-negative quantity |
| ITEM_004 | 404 | NOT_FOUND_ERROR | Item not found | Check item ID |
| ITEM_005 | 400 | VALIDATION_ERROR | Category not found | Use valid category ID |
| ITEM_006 | 400 | VALIDATION_ERROR | Supplier not found | Use valid supplier ID |
| ITEM_007 | 403 | AUTHORIZATION_ERROR | Insufficient permissions | Admin/Manager access required |
| ITEM_008 | 400 | VALIDATION_ERROR | Invalid price format | Use positive number |
| ITEM_009 | 400 | VALIDATION_ERROR | Invalid quantity format | Use integer |
| ITEM_010 | 409 | CONFLICT_ERROR | Cannot delete item with stock | Reduce stock to zero first |

### Request/Response Examples

#### GET /items (Paginated)
```
GET /items?page=1&limit=10&search=item&category=1&supplier=1&sortBy=name&sortOrder=asc

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10, max: 100)
- search: Search by name or SKU
- category: Filter by category ID
- supplier: Filter by supplier ID
- sortBy: Sort field (name, quantity, price, created_at)
- sortOrder: Sort order (asc, desc)
```

```json
// Success Response (200)
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Product A",
        "sku": "SKU-001",
        "description": "Product description",
        "quantity": 100,
        "price": 29.99,
        "category_id": 1,
        "supplier_id": 1,
        "low_stock_threshold": 10,
        "image_url": "https://...",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}

// Error Response
{
  "success": false,
  "message": "Invalid page number",
  "errorCode": "ITEM_011",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### GET /items/:id
```
GET /items/1
```

```json
// Success Response (200)
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product A",
    "sku": "SKU-001",
    "description": "Product description",
    "quantity": 100,
    "price": 29.99,
    "category": { "id": 1, "name": "Electronics" },
    "supplier": { "id": 1, "name": "Supplier A" },
    "low_stock_threshold": 10,
    "image_url": "https://...",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}

// Error Response - Item Not Found
{
  "success": false,
  "message": "Item not found with ID: 1",
  "errorCode": "ITEM_004",
  "timestamp": "2024-01-15T10:30:00Z",
  "debug": {
    "requestedId": "1",
    "databaseQuery": "SELECT * FROM items WHERE id = ?"
  }
}
```

#### POST /items (Create)
```json
// Request
{
  "name": "Product A",
  "sku": "SKU-001",
  "description": "Product description",
  "quantity": 100,
  "price": 29.99,
  "category_id": 1,
  "supplier_id": 1,
  "low_stock_threshold": 10,
  "image_url": "https://..."
}

// Success Response (201)
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "id": 1,
    "name": "Product A",
    "sku": "SKU-001",
    "created_at": "2024-01-15T10:30:00Z"
  }
}

// Error Response - Validation
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "ITEM_001",
  "errors": [
    { "field": "name", "message": "Item name is required" },
    { "field": "sku", "message": "SKU already exists" }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}

// Error Response - Category Not Found
{
  "success": false,
  "message": "Category not found with ID: 999",
  "errorCode": "ITEM_005",
  "timestamp": "2024-01-15T10:30:00Z",
  "debug": {
    "requestedCategoryId": "999",
    "availableCategories": "SELECT id, name FROM categories"
  }
}
```

#### PUT /items/:id (Update)
```json
// Request
{
  "name": "Updated Product A",
  "quantity": 150,
  "price": 34.99
}

// Success Response (200)
{
  "success": true,
  "message": "Item updated successfully",
  "data": {
    "id": 1,
    "updated_at": "2024-01-15T10:30:00Z"
  }
}

// Error Response - Authorization
{
  "success": false,
  "message": "Insufficient permissions to update item",
  "errorCode": "ITEM_007",
  "timestamp": "2024-01-15T10:30:00Z",
  "debug": {
    "userRole": "staff",
    "requiredRole": "manager"
  }
}
```

#### DELETE /items/:id (Delete)
```
DELETE /items/1
```

```json
// Success Response (200)
{
  "success": true,
  "message": "Item deleted successfully"
}

// Error Response - Cannot Delete with Stock
{
  "success": false,
  "message": "Cannot delete item with remaining stock",
  "errorCode": "ITEM_010",
  "timestamp": "2024-01-15T10:30:00Z",
  "debug": {
    "currentStock": 50,
    "suggestion": "Reduce stock to zero before deletion"
  }
}

// Error Response - Admin Only
{
  "success": false,
  "message": "Only administrators can delete items",
  "errorCode": "ITEM_007",
  "timestamp": "2024-01-15T10:30:00Z",
  "debug": {
    "userRole": "manager",
    "requiredRole": "admin"
  }
}
```

#### GET /items/low-stock
```
GET /items/low-stock?threshold=10
```

```json
// Success Response (200)
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Product A",
        "sku": "SKU-001",
        "quantity": 5,
        "low_stock_threshold": 10,
        "shortage": 5
      }
    ],
    "totalLowStockItems": 5,
    "criticalItems": 2
  }
}
```

---

## Categories Module

### Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /categories | Get all categories | Protected |
| GET | /categories/:id | Get category by ID | Protected |
| POST | /categories | Create category | Admin/Manager |
| PUT | /categories/:id | Update category | Admin/Manager |
| DELETE | /categories/:id | Delete category | Admin only |
| GET | /categories/tree | Get category tree | Protected |

### Category Errors

| Error Code | HTTP Status | Error Type | Description | Resolution |
|------------|-------------|------------|-------------|-------------|
| CAT_001 | 400 | VALIDATION_ERROR | Category name is required | Provide category name |
| CAT_002 | 400 | DUPLICATE_ERROR | Category name already exists | Use different name |
| CAT_003 | 404 | NOT_FOUND_ERROR | Category not found | Check category ID |
| CAT_004 | 400 | VALIDATION_ERROR | Invalid parent category | Parent must exist |
| CAT_005 | 400 | VALIDATION_ERROR | Cannot create more than 2 levels | Use existing parent |
| CAT_006 | 409 | CONFLICT_ERROR | Category has items | Delete or move items first |
| CAT_007 | 400 | VALIDATION_ERROR | Cannot set as parent of itself | Use different parent |

### Request/Response Examples

#### GET /categories
```
GET /categories?includeChildren=true
```

```json
// Success Response (200)
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Electronics",
        "description": "Electronic items",
        "parent_id": null,
        "item_count": 50,
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "name": "Phones",
        "description": "Mobile phones",
        "parent_id": 1,
        "item_count": 20,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /categories
```json
// Request
{
  "name": "Laptops",
  "description": "Laptop computers",
  "parent_id": 1
}

// Error Response - Hierarchy Limit
{
  "success": false,
  "message": "Cannot create category more than 2 levels deep",
  "errorCode": "CAT_005",
  "timestamp": "2024-01-15T10:30:00Z",
  "debug": {
    "parentPath": "Electronics > Phones > Accessories",
    "maxDepth": 2
  }
}
```

#### DELETE /categories/:id
```
DELETE /categories/1
```

```json
// Error Response - Has Items
{
  "success": false,
  "message": "Cannot delete category: 5 items assigned",
  "errorCode": "CAT_006",
  "timestamp": "2024-01-15T10:30:00Z",
  "debug": {
    "categoryId": 1,
    "itemCount": 5,
    "items": [
      { "id": 1, "name": "Product A" },
      { "id": 2, "name": "Product B" }
    ],
    "suggestion": "Move items to another category before deletion"
  }
}
```

---

## Suppliers Module

### Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /suppliers | Get all suppliers | Protected |
| GET | /suppliers/:id | Get supplier by ID | Protected |
| POST | /suppliers | Create supplier | Admin/Manager |
| PUT | /suppliers/:id | Update supplier | Admin/Manager |
| DELETE | /suppliers/:id | Delete supplier | Admin only |
| GET | /suppliers/:id/items | Get supplier's items | Protected |

### Supplier Errors

| Error Code | HTTP Status | Error Type | Description | Resolution |
|------------|-------------|------------|-------------|-------------|
| SUP_001 | 400 | VALIDATION_ERROR | Supplier name is required | Provide supplier name |
| SUP_002 | 400 | VALIDATION_ERROR | Invalid email format | Use valid email |
| SUP_003 | 400 | DUPLICATE_ERROR | Email already exists | Use different email |
| SUP_004 | 404 | NOT_FOUND_ERROR | Supplier not found | Check supplier ID |
| SUP_005 | 409 | CONFLICT_ERROR | Cannot delete: has active items | Remove item associations first |
| SUP_006 | 403 | AUTHORIZATION_ERROR | Admin/Manager access required | Check user role |

### Request/Response Examples

#### GET /suppliers
```
GET /suppliers?page=1&limit=10&search=supplier
```

```json
// Success Response (200)
{
  "success": true,
  "data": {
    "suppliers": [
      {
        "id": 1,
        "name": "ABC Suppliers",
        "contact_person": "John Doe",
        "email": "abc@supplier.com",
        "phone": "+1234567890",
        "address": "123 Main St",
        "item_count": 25,
        "is_active": true,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": { "currentPage": 1, "totalPages": 2, "totalItems": 15 }
  }
}
```

#### DELETE /suppliers/:id
```json
// Error Response - Has Active Items
{
  "success": false,
  "message": "Cannot delete supplier: 5 active items linked",
  "errorCode": "SUP_005",
  "timestamp": "2024-01-15T10:30:00Z",
  "debug": {
    "supplierId": 1,
    "linkedItems": [
      { "id": 1, "name": "Product A", "quantity": 100 },
      { "id": 2, "name": "Product B", "quantity": 50 }
    ],
    "suggestion": "Update items to remove supplier association"
  }
}
```

---

## Stock Management Module

### Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /stock/movements | Get stock movements | Protected |
| POST | /stock/adjust | Adjust stock | Admin/Manager |
| GET | /stock/history/:itemId | Get item stock history | Protected |
| POST | /stock/transfer | Transfer stock between locations | Admin/Manager |

### Stock Errors

| Error Code | HTTP Status | Error Type | Description | Resolution |
|------------|-------------|------------|-------------|-------------|
| STOCK_001 | 400 | VALIDATION_ERROR | Item ID is required | Provide item ID |
| STOCK_002 | 400 | VALIDATION_ERROR | Quantity must be positive | Use positive number |
| STOCK_003 | 400 | VALIDATION_ERROR | Insufficient stock | Check available quantity |
| STOCK_004 | 404 | NOT_FOUND_ERROR | Item not found | Check item ID |
| STOCK_005 | 400 | VALIDATION_ERROR | Invalid movement type | Use valid type |
| STOCK_006 | 403 | AUTHORIZATION_ERROR | Large adjustment requires approval | Contact manager |
| STOCK_007 | 409 | CONFLICT_ERROR | Cannot reduce below zero | Check current stock |

### Request/Response Examples

#### POST /stock/adjust
```json
// Request
{
  "item_id": 1,
  "quantity": 50,
  "type": "purchase",
  "notes": "Received from supplier",
  "date": "2024-01-15"
}

// Success Response (201)
{
  "success": true,
  "message": "Stock adjusted successfully",
  "data": {
    "movement_id": 1,
    "previous_quantity": 100,
    "new_quantity": 150,
    "type": "purchase"
  }
}

// Error Response - Insufficient Stock
{
  "success": false,
  "message": "Insufficient stock: available 20, requested 50",
  "errorCode": "STOCK_003",
  "timestamp": "2024-01-15T10:30:00Z",
  "debug": {
    "itemId": 1,
    "itemName": "Product A",
    "availableStock": 20,
    "requestedReduction": 50,
    "suggestion": "Reduce request to 20 or less"
  }
}
```

#### GET /stock/history/:itemId
```
GET /stock/history/1?startDate=2024-01-01&endDate=2024-01-31
```

```json
// Success Response (200)
{
  "success": true,
  "data": {
    "item": { "id": 1, "name": "Product A", "current_stock": 150 },
    "movements": [
      {
        "id": 1,
        "type": "purchase",
        "quantity_change": 50,
        "previous_quantity": 100,
        "new_quantity": 150,
        "notes": "Received from supplier",
        "performed_by": "John Doe",
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "type": "sale",
        "quantity_change": -10,
        "previous_quantity": 110,
        "new_quantity": 100,
        "notes": "Order #12345",
        "performed_by": "Jane Smith",
        "created_at": "2024-01-14T10:30:00Z"
      }
    ],
    "summary": {
      "total_in": 200,
      "total_out": 50,
      "net_change": 150
    }
  }
}
```

---

## Stock Alerts Module

### Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /alerts | Get all alerts | Protected |
| GET | /alerts/low-stock | Get low stock alerts | Protected |
| PUT | /alerts/:id/acknowledge | Acknowledge alert | Protected |
| PUT | /alerts/settings | Update alert settings | Admin only |
| GET | /alerts/summary | Get alert summary | Protected |

### Alert Errors

| Error Code | HTTP Status | Error Type | Description | Resolution |
|------------|-------------|------------|-------------|-------------|
| ALERT_001 | 404 | NOT_FOUND_ERROR | Alert not found | Check alert ID |
| ALERT_002 | 400 | VALIDATION_ERROR | Threshold must be positive | Use positive number |
| ALERT_003 | 403 | AUTHORIZATION_ERROR | Admin access required | Check user role |
| ALERT_004 | 400 | VALIDATION_ERROR | Invalid alert type | Use valid type |

### Request/Response Examples

#### GET /alerts/low-stock
```
GET /alerts/low-stock?severity=critical
```

```json
// Success Response (200)
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": 1,
        "item_id": 1,
        "item_name": "Product A",
        "current_quantity": 5,
        "threshold": 10,
        "severity": "critical",
        "created_at": "2024-01-15T10:30:00Z",
        "acknowledged": false
      }
    ],
    "summary": {
      "critical": 2,
      "warning": 5,
      "total": 7
    }
  }
}
```

#### PUT /alerts/:id/acknowledge
```json
// Request
{
  "notes": "Ordered restock"
}

// Success Response (200)
{
  "success": true,
  "message": "Alert acknowledged",
  "data": {
    "acknowledged_by": "John Doe",
    "acknowledged_at": "2024-01-15T10:30:00Z",
    "notes": "Ordered restock"
  }
}
```

---

## Reports/Analytics Module

### Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /reports/inventory | Inventory summary report | Manager/Admin |
| GET | /reports/stock-movement | Stock movement report | Manager/Admin |
| GET | /reports/valuation | Inventory valuation report | Manager/Admin |
| GET | /reports/category-analysis | Category analysis | Manager/Admin |
| GET | /reports/supplier-performance | Supplier performance | Manager/Admin |
| GET | /reports/dashboard | Dashboard metrics | Manager/Admin |

### Report Errors

| Error Code | HTTP Status | Error Type | Description | Resolution |
|------------|-------------|------------|-------------|-------------|
| RPT_001 | 403 | AUTHORIZATION_ERROR | Manager or admin access required | Check user role |
| RPT_002 | 400 | VALIDATION_ERROR | Invalid date range | Check dates |
| RPT_003 | 400 | VALIDATION_ERROR | Start date must be before end date | Fix date order |
| RPT_004 | 400 | VALIDATION_ERROR | Invalid export format | Use PDF, Excel, or CSV |

### Request/Response Examples

#### GET /reports/dashboard
```
GET /reports/dashboard
```

```json
// Success Response (200)
{
  "success": true,
  "data": {
    "overview": {
      "total_items": 150,
      "total_categories": 10,
      "total_suppliers": 25,
      "total_users": 5
    },
    "stock_summary": {
      "total_value": 150000.00,
      "total_quantity": 5000,
      "low_stock_items": 5,
      "out_of_stock_items": 2,
      "overstock_items": 10
    },
    "recent_movements": [
      { "type": "purchase", "quantity": 50, "item": "Product A", "date": "2024-01-15" }
    ],
    "top_categories": [
      { "name": "Electronics", "item_count": 50, "value": 50000 }
    ],
    "alerts": {
      "pending": 7,
      "critical": 2
    }
  }
}
```

#### GET /reports/inventory (with export)
```
GET /reports/inventory?startDate=2024-01-01&endDate=2024-01-31&format=excel&category=1
```

```json
// Success Response (200) - JSON
{
  "success": true,
  "data": {
    "report": "Inventory Summary",
    "generated_at": "2024-01-15T10:30:00Z",
    "date_range": { "start": "2024-01-01", "end": "2024-01-31" },
    "summary": {
      "total_items": 150,
      "total_value": 150000,
      "total_quantity": 5000
    },
    "items": [...]
  },
  "export_url": "/api/v1/reports/download/excel/abc123"
}
```

---

## User Management Module

### Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /users | Get all users | Admin only |
| GET | /users/:id | Get user by ID | Admin only |
| POST | /users | Create user | Admin only |
| PUT | /users/:id | Update user | Admin only |
| DELETE | /users/:id | Delete user | Admin only |
| PUT | /users/:id/status | Toggle user status | Admin only |
| POST | /users/:id/reset-password | Reset user password | Admin only |

### User Management Errors

| Error Code | HTTP Status | Error Type | Description | Resolution |
|------------|-------------|------------|-------------|-------------|
| USER_001 | 403 | AUTHORIZATION_ERROR | Admin access required | Check user role |
| USER_002 | 404 | NOT_FOUND_ERROR | User not found | Check user ID |
| USER_003 | 400 | DUPLICATE_ERROR | Email already exists | Use different email |
| USER_004 | 400 | VALIDATION_ERROR | Cannot delete own admin account | Use another admin |
| USER_005 | 400 | VALIDATION_ERROR | Cannot disable own admin account | Use another admin |
| USER_006 | 400 | VALIDATION_ERROR | Cannot change own role | Use another admin |
| USER_007 | 400 | VALIDATION_ERROR | Invalid role | Use admin, manager, or staff |

### Request/Response Examples

#### GET /users
```
GET /users?page=1&limit=10&role=staff&status=active
```

```json
// Success Response (200)
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin",
        "is_active": true,
        "created_at": "2024-01-15T10:30:00Z",
        "last_login": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": { "currentPage": 1, "totalPages": 1, "totalItems": 5 }
  }
}
```

#### DELETE /users/:id
```
DELETE /users/1
```

```json
// Error Response - Cannot Delete Self
{
  "success": false,
  "message": "Cannot delete your own admin account",
  "errorCode": "USER_004",
  "timestamp": "2024-01-15T10:30:00Z",
  "debug": {
    "targetUserId": 1,
    "currentUserId": 1,
    "suggestion": "Use another admin account to delete this user"
  }
}
```

---

## Global Error Response Format

All API errors follow this format:

```json
{
  "success": false,
  "message": "Human readable error message",
  "errorCode": "MODULE_CODE",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/items",
  "method": "POST",
  "errors": [
    { "field": "name", "message": "Item name is required" }
  ],
  "debug": {
    "description": "Additional debug information",
    "requestedId": "1",
    "databaseQuery": "SELECT * FROM items WHERE id = ?"
  }
}
```

## Error Handling Best Practices

1. **Always check error code** - Each error has a unique code for programmatic handling
2. **Check timestamp** - Useful for debugging when errors occurred
3. **Use debug info** - Contains query details and suggested resolutions
4. **Handle errors array** - For validation errors with multiple fields
5. **Status code mapping** - 4xx for client errors, 5xx for server errors

---

## Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation Error |
| 401 | Unauthorized - Authentication Required |
| 403 | Forbidden - Insufficient Permissions |
| 404 | Not Found - Resource Doesn't Exist |
| 409 | Conflict - Business Logic Error |
| 500 | Internal Server Error |