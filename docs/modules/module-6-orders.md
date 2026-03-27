# Module 6: Order Management

## Overview

The Order Management Module handles both purchase (incoming stock from suppliers) and sales (outgoing stock to customers), ensuring seamless integration with inventory, suppliers, and product modules while maintaining role-based access control (Admin, Manager, Staff).

## Module Status

**Status:** ✅ COMPLETED  
**Last Updated:** 2026-03-27

---

## Objectives

Handle the complete purchase and sales flow by enabling users to:
- Create and manage orders
- Track order status
- Automatically update inventory stock levels
- Maintain a history of all transactions for auditing and reporting purposes

---

## Input Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| order_type | ENUM | Yes | 'purchase' or 'sale' |
| supplier_id | INT | Conditional | Required for purchase orders |
| items | ARRAY | Yes | List of order items (item_id, quantity, unit_price) |
| notes | TEXT | No | Optional notes |
| status | ENUM | No | Default: 'pending' |

---

## Constraints

1. Must support adding multiple products in a single order
2. Supplier is mandatory for purchase orders but not required for sales
3. Stock must automatically increase for purchase orders and decrease for sales orders
4. Order number must be unique and auto-generated

---

## Implementation Details

### Backend Files

#### 1. Order Model (`backend/models/Order.js`)

Database model with full CRUD and order item management.

**Key Methods:**
- `findAll(options)` - Get all orders with pagination, search, filters
- `findById(id)` - Get single order with items
- `create(orderData)` - Create new order with items
- `update(id, orderData)` - Update order and items
- `delete(id)` - Delete order and items
- `updateStatus(id, status)` - Update order status

**Console Logging:**
- `[MODEL]` prefix for all database operations

#### 2. Order Service (`backend/services/orderService.js`)

Business logic with inventory integration.

**Key Functions:**
- `getAllOrders(options)` - Get all orders with filtering
- `getOrderById(id)` - Get order details
- `createOrder(orderData, userRole)` - Create new order
- `updateOrder(id, orderData, userRole)` - Update order
- `deleteOrder(id, userRole)` - Delete order
- `updateOrderStatus(id, status, userRole)` - Update status

**Key Features:**
- Validates supplier for purchase orders
- Generates unique order numbers
- Integrates with inventory for stock updates
- Role-based access control

**Console Logging:**
- `[SERVICE]` prefix for all business logic

**Error Codes:**
- `ORDER_001` - Validation errors
- `ORDER_004` - Order not found
- `ORDER_007` - Permission denied
- `ORDER_008` - Invalid operation

#### 3. Order Controller (`backend/controllers/orderController.js`)

Request handlers with proper error handling.

**Endpoints:**
- GET /api/v1/orders - List orders
- GET /api/v1/orders/:id - Get order details
- POST /api/v1/orders - Create order
- PUT /api/v1/orders/:id - Update order
- PATCH /api/v1/orders/:id/status - Update status
- DELETE /api/v1/orders/:id - Delete order

**Console Logging:**
- `[CONTROLLER]` prefix for all requests

#### 4. Order Routes (`backend/routes/orderRoutes.js`)

API routes with middleware protection.

**Middleware:**
- verifyToken - All routes require authentication
- checkRole - Admin/Manager for create/update/delete

---

### Frontend Files

#### 1. Order List (`frontend/src/pages/orders/OrderList.jsx`)

Order table with features:
- Search by order number
- Filter by order type and status
- Pagination
- Status update functionality
- Create new order button
- View/Edit/Delete actions

**Console Logging:**
- `[OrderList]` prefix for component operations

#### 2. Order Form (`frontend/src/pages/orders/OrderForm.jsx`)

Create/Edit order form with:
- Order type selection (purchase/sale)
- Dynamic supplier dropdown (loaded from API)
- Dynamic product/item selection
- Multiple items with quantity and price
- Automatic total calculation
- Validation for required fields

**Console Logging:**
- `[OrderForm]` prefix for component operations

**Key Features:**
- Dynamic supplier loading from `/api/v1/suppliers`
- Inventory items loaded from `/api/v1/inventory`
- Disabled supplier field for sale orders
- Required supplier for purchase orders

#### 3. Order Details (`frontend/src/pages/orders/OrderDetails.jsx`)

Order view page with:
- Order information display
- Order items table
- Status management
- Order history/timeline

**Console Logging:**
- `[OrderDetails]` prefix for component operations

#### 4. Order API Service (`frontend/src/services/orderAPI.js`)

API service with all endpoints.

**Methods:**
- `getAll(params)` - Get all orders
- `getById(id)` - Get order by ID
- `create(data)` - Create order
- `update(id, data)` - Update order
- `updateStatus(id, status)` - Update status
- `delete(id)` - Delete order

**Console Logging:**
- `[API]` prefix for all requests

---

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/v1/orders | All | List orders with pagination, search, filters |
| GET | /api/v1/orders/:id | All | Get single order with items |
| POST | /api/v1/orders | Admin/Manager | Create new order |
| PUT | /api/v1/orders/:id | Admin/Manager | Update order |
| PATCH | /api/v1/orders/:id/status | Admin/Manager | Update order status |
| DELETE | /api/v1/orders/:id | Admin | Delete order |

### Query Parameters (GET /api/v1/orders)

| Parameter | Type | Description |
|-----------|------|-------------|
| page | INT | Page number (default: 1) |
| limit | INT | Items per page (default: 10) |
| search | STRING | Search by order number |
| order_type | STRING | Filter by 'purchase' or 'sale' |
| status | STRING | Filter by status |
| sortBy | STRING | Sort field (default: created_at) |
| sortOrder | STRING | Sort order (asc/desc) |

---

## Database Schema

### Orders Table

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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### Order Items Table

```sql
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);
```

---

## Role-Based Access Control

| Role | View Orders | Create Order | Update Order | Update Status | Delete Order |
|------|-------------|--------------|--------------|---------------|--------------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ✅ | ✅ | ❌ |
| Staff | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Integration with Other Modules

### Inventory Module
- **Purchase Order**: Increases item quantity in inventory
- **Sale Order**: Decreases item quantity in inventory
- Uses `updateQuantity` method from InventoryItem model

### Supplier Module
- **Purchase Orders**: Links to supplier (required)
- **Sale Orders**: No supplier (optional)
- Displays supplier name in order details

---

## Console Logging Conventions

All console logs follow a consistent prefix pattern:

| Prefix | Location | Example |
|--------|----------|---------|
| [MODEL] | backend/models/Order.js | `[MODEL] findAll - Executing query` |
| [SERVICE] | backend/services/orderService.js | `[SERVICE] createOrder - Creating order` |
| [CONTROLLER] | backend/controllers/orderController.js | `[CONTROLLER] getAllOrders - Request params` |
| [API] | frontend/src/services/orderAPI.js | `[API] getAll - Request params` |
| [OrderList] | frontend/src/pages/orders/OrderList.jsx | `[OrderList] Fetching orders` |
| [OrderForm] | frontend/src/pages/orders/OrderForm.jsx | `[OrderForm] Submitting order` |
| [OrderDetails] | frontend/src/pages/orders/OrderDetails.jsx | `[OrderDetails] Loading order` |

---

## Error Handling

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| ORDER_001 | Validation error | 400 |
| ORDER_004 | Order not found | 404 |
| ORDER_007 | Permission denied | 403 |
| ORDER_008 | Invalid operation | 400 |
| ORDER_500 | Internal server error | 500 |

### Error Response Format

```json
{
  "success": false,
  "errorCode": "ORDER_001",
  "message": "Validation failed",
  "errors": [
    { "field": "supplier_id", "message": "Supplier is required for purchase orders" }
  ],
  "debug": {
    "service": "createOrder",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

---

## Testing Checklist

### Backend API Testing

- [ ] GET /api/v1/orders - List all orders (paginated)
- [ ] GET /api/v1/orders?search=ORD-001 - Search orders
- [ ] GET /api/v1/orders?order_type=purchase - Filter by type
- [ ] GET /api/v1/orders?status=pending - Filter by status
- [ ] GET /api/v1/orders/:id - Get order details
- [ ] POST /api/v1/orders - Create purchase order
- [ ] POST /api/v1/orders - Create sale order
- [ ] PUT /api/v1/orders/:id - Update order
- [ ] PATCH /api/v1/orders/:id/status - Update status
- [ ] DELETE /api/v1/orders/:id - Delete order

### Frontend Testing

- [ ] Order list displays with pagination
- [ ] Search functionality works
- [ ] Filters work (type, status)
- [ ] Create order form loads suppliers dynamically
- [ ] Create order form loads inventory items
- [ ] Add/remove items in order form
- [ ] Total calculation is correct
- [ ] Validation shows errors properly
- [ ] Order details displays all information
- [ ] Status update works

### Integration Testing

- [ ] Purchase order increases inventory stock
- [ ] Sale order decreases inventory stock
- [ ] Supplier linked to purchase orders
- [ ] Role-based access enforced

---

## Dependencies

### Backend Dependencies
- express
- mysql2
- jsonwebtoken
- bcryptjs

### Frontend Dependencies
- react
- react-router-dom
- axios

---

## Related Documentation

- [API Documentation](../api-documentation.md)
- [Inventory Modules Breakdown](../inventory-modules-breakdown.md)
- [Coding Standards](../coding-standards.md)
- [Project Structure](../project-structure.md)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-03-27 | Initial implementation | Development Team |
| 2026-03-27 | Added dynamic supplier loading | Development Team |