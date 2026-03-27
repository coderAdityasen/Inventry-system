# Module 7: Reports & Analytics

## Overview

Reporting and analytics system within the inventory application that aggregates data from inventory, orders, and suppliers to provide meaningful business insights, enabling Admin and Manager roles to monitor performance, track stock levels, and make data-driven decisions, while Staff users may have limited or view-only access.

## Module Status

**Status:** ✅ COMPLETED  
**Last Updated:** 2026-03-27

---

## Objectives

Provide system insights by generating real-time and historical reports on inventory and sales, highlighting key metrics such as:
- Current stock levels
- Sales performance
- Low stock alerts

With filtering capabilities to analyze data over specific date ranges.

---

## Input Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| startDate | DATE | No | Start date for report (YYYY-MM-DD) |
| endDate | DATE | No | End date for report (YYYY-MM-DD) |
| reportType | STRING | No | Type: inventory, sales, low_stock |
| groupBy | STRING | No | Group by: day, week, month |
| limit | INT | No | Number of results (1-100) |

---

## Implementation Details

### Backend Files

#### 1. Report Model (`backend/models/Report.js`)

Database model with analytics queries.

**Key Methods:**
- `getInventorySummary()` - Total items, quantity, value, low stock count
- `getInventoryByCategory()` - Stock breakdown by category
- `getInventoryBySupplier()` - Stock breakdown by supplier
- `getLowStockItems(limit)` - Items at/below threshold
- `getOutOfStockItems(limit)` - Items with zero quantity
- `getSalesSummary(startDate, endDate)` - Sales metrics
- `getSalesByDate(startDate, endDate, groupBy)` - Sales timeline
- `getTopSellingItems(startDate, endDate, limit)` - Best sellers
- `getTopSuppliers(startDate, endDate, limit)` - Top suppliers
- `getCategoryPerformance(startDate, endDate)` - Category sales
- `getDashboardSummary()` - Key metrics for dashboard
- `getRecentActivity(limit)` - Recent orders and updates

**Console Logging:**
- `[MODEL]` prefix for all database operations

#### 2. Report Service (`backend/services/reportService.js`)

Business logic with validation.

**Key Functions:**
- `getInventorySummary()` - Get inventory stats
- `getInventoryByCategory()` - Category breakdown
- `getInventoryBySupplier()` - Supplier breakdown
- `getLowStockItems(limit)` - Low stock alerts
- `getOutOfStockItems(limit)` - Out of stock items
- `getSalesSummary(startDate, endDate)` - Sales metrics
- `getSalesByDate(startDate, endDate, groupBy)` - Timeline
- `getTopSellingItems(startDate, endDate, limit)` - Best sellers
- `getTopSuppliers(startDate, endDate, limit)` - Top suppliers
- `getCategoryPerformance(startDate, endDate)` - Category analysis
- `getDashboardSummary()` - Dashboard data
- `getRecentActivity(limit)` - Activity feed

**Console Logging:**
- `[SERVICE]` prefix for all business logic

**Error Codes:**
- `REPORT_001` - Validation errors
- `REPORT_500` - Internal server error

#### 3. Report Controller (`backend/controllers/reportController.js`)

Request handlers with proper error handling.

**Endpoints:**
- GET /api/v1/reports/inventory-summary
- GET /api/v1/reports/inventory-by-category
- GET /api/v1/reports/inventory-by-supplier
- GET /api/v1/reports/low-stock
- GET /api/v1/reports/out-of-stock
- GET /api/v1/reports/sales-summary (admin/manager)
- GET /api/v1/reports/sales-by-date (admin/manager)
- GET /api/v1/reports/top-selling (admin/manager)
- GET /api/v1/reports/top-suppliers (admin/manager)
- GET /api/v1/reports/category-performance (admin/manager)
- GET /api/v1/reports/dashboard-summary
- GET /api/v1/reports/recent-activity

**Console Logging:**
- `[CONTROLLER]` prefix for all requests

#### 4. Report Routes (`backend/routes/reportRoutes.js`)

API routes with middleware protection.

**Middleware:**
- verifyToken - All routes require authentication
- checkRole - Admin/Manager for sales reports

---

### Frontend Files

#### 1. Reports Page (`frontend/src/pages/reports/Reports.jsx`)

Reports dashboard with tabs.

**Features:**
- Overview tab: Summary cards, order/supplier/category stats
- Inventory tab: Inventory summary, stock status
- Sales tab: Revenue, top selling items (admin/manager only)
- Stock Alerts tab: Low stock items table

**Tabs:**
- Overview (all users)
- Inventory (all users)
- Sales (admin/manager only)
- Stock Alerts (all users)

**Date Filters:**
- Start date / End date for sales data
- Apply Filter button

**Console Logging:**
- `[Reports]` prefix for component operations

#### 2. Report API Service (`frontend/src/services/reportAPI.js`)

API service with all endpoints.

**Methods:**
- `getInventorySummary()` - Get inventory summary
- `getInventoryByCategory()` - Get by category
- `getInventoryBySupplier()` - Get by supplier
- `getLowStockItems(limit)` - Get low stock
- `getOutOfStockItems(limit)` - Get out of stock
- `getSalesSummary(startDate, endDate)` - Get sales
- `getSalesByDate(startDate, endDate, groupBy)` - Get timeline
- `getTopSellingItems(startDate, endDate, limit)` - Get best sellers
- `getTopSuppliers(startDate, endDate, limit)` - Get top suppliers
- `getCategoryPerformance(startDate, endDate)` - Get category data
- `getDashboardSummary()` - Get dashboard data
- `getRecentActivity(limit)` - Get activity

**Console Logging:**
- `[API]` prefix for all requests

---

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/v1/reports/inventory-summary | All | Inventory summary |
| GET | /api/v1/reports/inventory-by-category | All | By category |
| GET | /api/v1/reports/inventory-by-supplier | All | By supplier |
| GET | /api/v1/reports/low-stock | All | Low stock items |
| GET | /api/v1/reports/out-of-stock | All | Out of stock items |
| GET | /api/v1/reports/sales-summary | Admin/Manager | Sales summary |
| GET | /api/v1/reports/sales-by-date | Admin/Manager | Sales timeline |
| GET | /api/v1/reports/top-selling | Admin/Manager | Best sellers |
| GET | /api/v1/reports/top-suppliers | Admin/Manager | Top suppliers |
| GET | /api/v1/reports/category-performance | Admin/Manager | Category analysis |
| GET | /api/v1/reports/dashboard-summary | All | Dashboard data |
| GET | /api/v1/reports/recent-activity | All | Activity feed |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | STRING | Start date (YYYY-MM-DD) |
| endDate | STRING | End date (YYYY-MM-DD) |
| groupBy | STRING | day, week, month |
| limit | INT | Results limit (1-100) |

---

## Role-Based Access Control

| Role | Overview | Inventory | Sales | Stock Alerts |
|------|-----------|------------|-------|--------------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ✅ | ✅ |
| Staff | ✅ | ✅ | ❌ | ✅ |

---

## Console Logging Conventions

All console logs follow a consistent prefix pattern:

| Prefix | Location | Example |
|--------|----------|---------|
| [MODEL] | backend/models/Report.js | `[MODEL] getInventorySummary - Starting query` |
| [SERVICE] | backend/services/reportService.js | `[SERVICE] getInventorySummary - Starting service` |
| [CONTROLLER] | backend/controllers/reportController.js | `[CONTROLLER] getInventorySummary - Starting controller` |
| [API] | frontend/src/services/reportAPI.js | `[API] report.getInventorySummary - Request started` |
| [Reports] | frontend/src/pages/reports/Reports.jsx | `[Reports] Loading dashboard data` |

---

## Error Handling

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| REPORT_001 | Validation error | 400 |
| REPORT_500 | Internal server error | 500 |

### Error Response Format

```json
{
  "success": false,
  "errorCode": "REPORT_001",
  "message": "Validation failed",
  "debug": {
    "service": "getSalesSummary",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

---

## Response Status Codes

All responses include `success: true` or `success: false` to identify working vs non-working APIs.

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "errorCode": "REPORT_500",
  "message": "Failed to get inventory summary",
  "debug": { ... }
}
```

---

## Testing Checklist

### API Testing

- [ ] GET /api/v1/reports/inventory-summary
- [ ] GET /api/v1/reports/inventory-by-category
- [ ] GET /api/v1/reports/inventory-by-supplier
- [ ] GET /api/v1/reports/low-stock?limit=10
- [ ] GET /api/v1/reports/out-of-stock?limit=10
- [ ] GET /api/v1/reports/sales-summary
- [ ] GET /api/v1/reports/sales-summary?startDate=2026-01-01&endDate=2026-03-27
- [ ] GET /api/v1/reports/sales-by-date?startDate=2026-01-01&endDate=2026-03-27
- [ ] GET /api/v1/reports/top-selling?limit=10
- [ ] GET /api/v1/reports/top-suppliers?limit=10
- [ ] GET /api/v1/reports/category-performance
- [ ] GET /api/v1/reports/dashboard-summary
- [ ] GET /api/v1/reports/recent-activity?limit=10

### Frontend Testing

- [ ] Reports page loads with overview tab
- [ ] All summary cards display correctly
- [ ] Inventory tab shows stock status
- [ ] Sales tab accessible by admin/manager only
- [ ] Stock Alerts tab shows low stock items
- [ ] Date filters work for sales data
- [ ] Refresh button reloads data
- [ ] Error messages display properly
- [ ] Loading states work correctly

### Integration Testing

- [ ] Dashboard navigation to Reports works
- [ ] Role-based access enforced
- [ ] Date range filtering works

---

## Dependencies

### Backend Dependencies
- express
- mysql2

### Frontend Dependencies
- react
- react-router-dom
- axios

---

## Related Documentation

- [API Documentation](../api-documentation.md)
- [Inventory Modules Breakdown](../inventory-modules-breakdown.md)
- [Coding Standards](../coding-standards.md)
- [Module 6: Order Management](./module-6-orders.md)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-03-27 | Initial implementation | Development Team |