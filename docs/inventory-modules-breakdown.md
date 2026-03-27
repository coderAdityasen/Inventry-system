# Inventory Management System - Module Breakdown

Based on project analysis, here are the modules required for a complete working inventory system. Each module is defined with Context, Objective, Input, Constraints, and Output.

---

## 1. Authentication Module (COMPLETED)

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

---

## 2. Items/Inventory Module

**Context:** Core inventory management - managing all products/items  
**Objective:** Full CRUD operations for inventory items with stock tracking, search, and filtering  
**Input:** Item data (name, description, quantity, price, category, supplier, SKU, image)  
**Constraints:**
- Quantity cannot be negative
- Unique SKU required
- Category and supplier must exist
- Role-based access (admin/manager: full CRUD, staff: read-only or limited edit)
**Output:** Item list with pagination, single item details, stock status, CRUD response

**Backend Files to Create:**
- `backend/models/InventoryItem.js` - Database model
- `backend/controllers/inventoryController.js` - Request handlers
- `backend/services/inventoryService.js` - Business logic
- `backend/routes/inventoryRoutes.js` - API routes

**Frontend Pages to Create:**
- `frontend/src/pages/inventory/InventoryList.jsx` - Main inventory view
- `frontend/src/pages/inventory/InventoryForm.jsx` - Add/Edit item form
- `frontend/src/pages/inventory/InventoryDetails.jsx` - Single item view

---

## 3. Categories Module

**Context:** Product categorization system  
**Objective:** Manage product categories for organization and filtering  
**Input:** Category name, description, parent category (for hierarchy)  
**Constraints:**
- Unique category names
- Maximum 2-level hierarchy (parent/child)
- Cannot delete if items exist in category
**Output:** Category tree, category list, CRUD response

**Backend Files:**
- `backend/models/Category.js`
- `backend/controllers/categoryController.js`
- `backend/services/categoryService.js`
- `backend/routes/categoryRoutes.js`

**Frontend Files:**
- `frontend/src/pages/categories/CategoryList.jsx`
- `frontend/src/pages/categories/CategoryForm.jsx`

---

## 4. Suppliers Module

**Context:** Supplier/vendor management  
**Objective:** Manage supplier information, contact details, and supplier-item relationships  
**Input:** Supplier name, contact person, email, phone, address, notes  
**Constraints:**
- Unique email per supplier
- Cannot delete if linked to active items
- Admin/manager only for full CRUD
**Output:** Supplier list, supplier details, CRUD response

**Backend Files:**
- `backend/models/Supplier.js`
- `backend/controllers/supplierController.js`
- `backend/services/supplierService.js`
- `backend/routes/supplierRoutes.js`

**Frontend Files:**
- `frontend/src/pages/suppliers/SupplierList.jsx`
- `frontend/src/pages/suppliers/SupplierForm.jsx`
- `frontend/src/pages/suppliers/SupplierDetails.jsx`

---

## 5. Stock Management Module

**Context:** Stock movement tracking and adjustments  
**Objective:** Track stock in/out, adjustments, and maintain stock history  
**Input:** Item ID, quantity change, type (purchase, sale, adjustment, return), notes, date  
**Constraints:**
- Cannot reduce below zero
- Requires authorization for large adjustments
- All movements logged
**Output:** Stock history, current quantity, movement reports

**Backend Files:**
- `backend/models/StockMovement.js`
- `backend/controllers/stockController.js`
- `backend/services/stockService.js`
- `backend/routes/stockRoutes.js`

**Frontend Files:**
- `frontend/src/pages/stock/StockMovements.jsx`
- `frontend/src/pages/stock/StockAdjustment.jsx`

---

## 6. Stock Alerts Module

**Context:** Low stock notifications  
**Objective:** Automatic alerts when items fall below threshold quantities  
**Input:** Item ID, threshold value, alert type (low stock, out of stock)  
**Constraints:**
- Configurable threshold per item
- Email/notification to relevant users
- Daily/weekly summary option
**Output:** Alert list, alert configuration, notification settings

**Backend Files:**
- `backend/models/Alert.js`
- `backend/controllers/alertController.js`
- `backend/services/alertService.js`
- `backend/services/notificationService.js`

**Frontend Files:**
- `frontend/src/pages/alerts/AlertsList.jsx`
- `frontend/src/pages/alerts/AlertSettings.jsx`

---

## 7. Reports/Analytics Module

**Context:** Business intelligence and reporting  
**Objective:** Generate inventory reports, analytics, and visualizations  
**Input:** Date range, report type, filters (category, supplier, etc.)  
**Constraints:**
- Manager/admin access only
- Export options (PDF, Excel)
- Real-time data calculation
**Output:** Report data, charts, export files

**Backend Files:**
- `backend/controllers/reportController.js`
- `backend/services/reportService.js`
- `backend/routes/reportRoutes.js`

**Frontend Files:**
- `frontend/src/pages/reports/Dashboard.jsx`
- `frontend/src/pages/reports/InventoryReport.jsx`
- `frontend/src/pages/reports/StockMovementReport.jsx`

---

## 8. User Management Module

**Context:** Admin-level user administration  
**Objective:** Manage system users, roles, and permissions  
**Input:** User data (name, email, role), status changes, password reset  
**Constraints:**
- Admin only access
- Cannot delete own admin account
- Password requirements enforced
**Output:** User list, user details, CRUD response

**Backend Files:**
- `backend/controllers/userController.js`
- `backend/services/userService.js`
- `backend/routes/userRoutes.js`

**Frontend Files:**
- `frontend/src/pages/admin/UsersList.jsx`
- `frontend/src/pages/admin/UserForm.jsx`
- `frontend/src/pages/admin/UserDetails.jsx`

---

## 9. Dashboard Module

**Context:** Main landing page after login  
**Objective:** Display key metrics, quick actions, and system overview  
**Input:** User context, role-based data  
**Constraints:**
- Role-specific widgets
- Real-time data
- Responsive design
**Output:** Dashboard widgets, quick stats, recent activity

**Frontend Files (Update):**
- `frontend/src/pages/Dashboard.jsx` - Needs complete rewrite with:
  - Total inventory value
  - Low stock items count
  - Recent stock movements
  - Quick action buttons
  - Charts (items by category, stock levels)

---

## 10. Search & Filter Module

**Context:** Global search and advanced filtering  
**Objective:** Quick search across items, categories, suppliers with advanced filters  
**Input:** Search query, filter parameters, sort options  
**Constraints:**
- Debounced search (300ms)
- Pagination for large results
- Full-text search capability
**Output:** Filtered results, filter options, search suggestions

**Backend Files:**
- `backend/services/searchService.js`

**Frontend Components:**
- `frontend/src/components/search/SearchBar.jsx`
- `frontend/src/components/filters/FilterPanel.jsx`

---

## Implementation Order Recommendation

1. **Phase 1 - Core Items:** Items CRUD, Categories CRUD (Foundation)
2. **Phase 2 - Inventory Operations:** Suppliers, Stock Movements (Essential features)
3. **Phase 3 - Alerts & Notifications:** Stock alerts, notifications (Monitoring)
4. **Phase 4 - Business Intelligence:** Reports, Dashboard analytics (Insights)
5. **Phase 5 - Administration:** User management, settings (Control)

---

## Summary Table

| Module | Backend Files | Frontend Pages | Priority |
|--------|--------------|----------------|----------|
| Items/Inventory | 4 | 3 | P1 |
| Categories | 4 | 2 | P1 |
| Suppliers | 4 | 3 | P2 |
| Stock Management | 4 | 2 | P2 |
| Stock Alerts | 4 | 2 | P3 |
| Reports/Analytics | 3 | 3 | P4 |
| User Management | 3 | 3 | P5 |
| Dashboard | 0 | 1 (rewrite) | P2 |
| Search & Filter | 1 | 2 | P3 |