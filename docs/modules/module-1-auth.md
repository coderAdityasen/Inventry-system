# Module 1: Authentication & Authorization

## 1. MODULE OVERVIEW

### Module Name
**Authentication & Authorization Module**

### Purpose
Provides secure user authentication and role-based access control for the Inventory Management System. Handles user registration, login, token management, and route protection.

### Scope
- User registration with role assignment
- JWT-based login system
- Access token (6 hours) + Refresh token (7 days)
- Role-based route protection on both frontend and backend
- Automatic token refresh via interceptors

### Roles Involved
| Role | Access Level |
|------|--------------|
| `admin` | Full access to all features |
| `manager` | Limited admin access + reports |
| `staff` | Read + basic operations only |

---

## 2. PROJECT STRUCTURE

```
backend/
├── config/
│   └── db.js                    # MySQL connection pool + schema init
├── controllers/
│   └── auth.controller.js       # HTTP request handlers
├── middleware/
│   ├── auth.js                  # JWT verification middleware
│   └── role.js                  # Role-based access control
├── models/
│   └── user.model.js            # User database operations
├── routes/
│   └── auth.routes.js           # Auth API routes
├── services/
│   └── auth.service.js          # Business logic
└── src/
    └── index.js                  # Express app entry point

frontend/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.jsx   # Route guard component
│   ├── context/
│   │   └── AuthContext.jsx       # Global auth state
│   ├── hooks/
│   │   └── useAuth.js           # Auth helper hook
│   ├── pages/
│   │   ├── Login.jsx            # Login page
│   │   ├── Register.jsx        # Registration page
│   │   ├── Dashboard.jsx        # Protected dashboard
│   │   └── Home.jsx             # Landing page
│   ├── services/
│   │   └── api.js               # Axios with interceptors
│   ├── App.jsx                  # Main app with routing
│   ├── index.css                # Tailwind styles
│   └── main.jsx                  # React entry point
```

---

## 3. ARCHITECTURE & DATA FLOW

### Registration Flow
```
User fills form → Validate inputs → Check email exists → 
Hash password (bcryptjs, 12 rounds) → Insert to DB → Return user data
```

### Login Flow
```
User submits credentials → Find user by email → 
Verify password (bcrypt.compare) → Check is_active → 
Generate JWT tokens → Store refresh_token in DB → 
Set httpOnly cookie + return accessToken
```

### Token Structure

**Access Token (JWT)**
```javascript
{
  id: 1,
  email: "admin@test.com",
  role: "admin",
  iat: 1774521936,
  exp: 1774543536  // 6 hours
}
```

**Refresh Token (JWT)**
```javascript
{
  id: 1,
  iat: 1774521936,
  exp: 1775126736  // 7 days
}
```

### Token Refresh Flow
```
1. Access token expires
2. Frontend axios interceptor detects 401
3. Send refresh token (from cookie) to /api/auth/refresh-token
4. Backend verifies refresh token, generates new tokens
5. New tokens returned, old refresh token rotated
6. Original request retried with new access token
```

### Role Check Flow
```
Request arrives → verifyToken middleware → 
checkRole(['admin', 'manager']) middleware → 
Allow/Deny based on req.user.role
```

---

## 4. DATABASE SCHEMA

### Table: users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user ID |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `role` | ENUM | DEFAULT 'staff' | admin/manager/staff |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account status |
| `refresh_token` | TEXT | NULLABLE | Stored JWT for session |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update |

### Why These Fields?

- **`refresh_token`**: Stored in DB to allow session revocation and token rotation
- **`is_active`**: Allows disabling accounts without deleting data
- **`role`**: ENUM ensures only valid roles can be assigned
- **`updated_at`**: Auto-updates on any change for audit trails

---

## 5. API ENDPOINTS REFERENCE

### POST /api/auth/register

**Description**: Register a new user

**Request Body**:
```json
{
  "name": "string (required, min 2 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)",
  "role": "string (optional, default: staff)"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Test Admin",
      "email": "admin@test.com",
      "role": "admin"
    }
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### POST /api/auth/login

**Description**: Authenticate user and get tokens

**Request Body**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Test Admin",
      "email": "admin@test.com",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Response** (401):
```json
{
  "success": false,
  "message": "Invalid email or password",
  "status": 401
}
```

**Side Effect**: Sets httpOnly `refreshToken` cookie (7 days)

---

### POST /api/auth/logout

**Description**: Logout user and clear session

**Headers**: `Authorization: Bearer <access_token>`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Side Effect**: Clears refreshToken cookie, nullifies DB refresh_token

---

### POST /api/auth/refresh-token

**Description**: Get new access token using refresh token

**Request**: Cookie or body with refreshToken

**Success Response** (200):
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Side Effect**: Rotates refresh token, sets new cookie

---

### GET /api/auth/me

**Description**: Get current authenticated user

**Headers**: `Authorization: Bearer <access_token>`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Test Admin",
      "email": "admin@test.com",
      "role": "admin",
      "is_active": true,
      "created_at": "2026-03-26T10:45:20.000Z",
      "updated_at": "2026-03-26T10:45:36.000Z"
    }
  }
}
```

---

## 6. FRONTEND REFERENCE

### Route List

| Route | Access Level | Description |
|-------|--------------|-------------|
| `/` | Public | Landing page (redirects to /dashboard if logged in) |
| `/login` | Public | Login form |
| `/register` | Public | Registration form |
| `/dashboard` | Protected | Main dashboard (any role) |

### AuthContext State

```javascript
// What it holds
{
  user: { id, name, email, role },      // Current user
  accessToken: "string",                 // JWT access token  
  isLoading: boolean,                    // Initial auth check
  error: string | null,                   // Error messages
}

// What it exposes
{
  login(email, password) → Promise,
  register(name, email, password, role) → Promise,
  logout() → Promise,
  clearError() → void,
  isAuthenticated: boolean,
}
```

### useAuth Hook

```javascript
const { 
  user,           // User object
  isAuthenticated, // Boolean
  isLoading,       // Loading state
  error,           // Error message
  login,           // Login function
  register,        // Register function
  logout,          // Logout function
  hasRole,         // (role) => boolean
  hasAnyRole,      // (roles[]) => boolean
  isAdmin,         // () => boolean
  isManager,       // () => boolean
  isStaff          // () => boolean
} = useAuth();
```

### Axios Interceptor (Token Refresh)

```javascript
// From frontend/src/services/api.js
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await api.post('/api/auth/refresh-token');
        const { accessToken: newToken } = response.data.data;
        
        setAccessToken(newToken);
        localStorage.setItem('accessToken', newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

### ProtectedRoute Component

```jsx
// From frontend/src/components/ProtectedRoute.jsx
<ProtectedRoute allowedRoles={['admin', 'manager']}>
  <AdminPanel />
</ProtectedRoute>
```

The component:
1. Checks if authenticated (redirects to /login if not)
2. Validates user role against allowedRoles
3. Shows 403 if role not permitted
4. Renders children if all checks pass

---

## 7. SECURITY DECISIONS

### Why httpOnly Cookie for Refresh Token?
- **XSS Prevention**: JavaScript cannot access httpOnly cookies
- **Automatic**: Browser sends cookie with requests automatically
- **Security**: Even if attacker injects JS, they cannot steal refresh token

### Why Memory + LocalStorage for Access Token?
- **Memory**: Primary store for fast access during session
- **LocalStorage**: Backup for page refreshes and tab reopens
- **Trade-off**: Vulnerable to XSS, but shorter expiry (6h) limits damage

### Token Expiry Strategy
| Token | Expiry | Reason |
|-------|--------|--------|
| Access | 6 hours | Balance between security and UX |
| Refresh | 7 days | Allow extended sessions, enable revocation |

### Password Hashing
- **Algorithm**: bcryptjs
- **Rounds**: 12 (CPU-intensive, secure against brute force)
- **Storage**: Full hash stored, never plain text

---

## 8. HOW TO USE IN FUTURE MODULES

### Protecting a Backend Route

```javascript
// In backend/routes/yourRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Public route
router.get('/public-data', (req, res) => {
  res.json({ data: 'public' });
});

// Protected route (any authenticated user)
router.get('/protected', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Admin only
router.delete('/admin-only', verifyToken, checkRole(['admin']), (req, res) => {
  res.json({ message: 'Admin action completed' });
});

// Manager or Admin
router.post('/manage-items', verifyToken, checkRole(['admin', 'manager']), (req, res) => {
  res.json({ message: 'Item managed' });
});

module.exports = router;
```

### Using useAuth in a New Page

```jsx
// In frontend/src/pages/YourPage.jsx
import useAuth from '../hooks/useAuth';

function YourPage() {
  const { user, hasRole, isAdmin } = useAuth();
  
  if (isAdmin()) {
    return <AdminContent />;
  }
  
  return <UserContent />;
}
```

### Making Authenticated API Calls

```javascript
// Using the pre-configured axios instance
import api from '../services/api';

async function fetchData() {
  // Access token automatically added via interceptor
  const response = await api.get('/api/v1/items');
  return response.data;
}

async function createItem(itemData) {
  const response = await api.post('/api/v1/items', itemData);
  return response.data;
}
```

---

## 9. KNOWN LIMITATIONS & FUTURE IMPROVEMENTS

### Current Limitations
- No email verification after registration
- No password reset functionality
- No two-factor authentication (2FA)
- Refresh token rotation not fully implemented (same token reused)
- No rate limiting on auth endpoints
- No OAuth/social login (Google, GitHub, etc.)
- No session invalidation across devices

### Future Improvements (Phase 2+)
1. **Email Verification** - Send verification link on register
2. **Password Reset** - Token-based password reset flow
3. **2FA** - TOTP-based two-factor authentication
4. **OAuth** - Social login integration
5. **Device Management** - View/revoke active sessions
6. **Audit Logging** - Track all auth events
7. **IP Blocking** - Prevent brute force attacks
8. **JWT Blacklisting** - Invalidate tokens on logout (forremember-me)

### Tech Debt
- Consider moving access token to httpOnly cookie for better XSS protection
- Implement refresh token rotation (generate new refresh token on each use)
- Add request rate limiting with express-rate-limit
- Add comprehensive error codes for different auth failure scenarios

---

## Quick Reference

| Component | File | Purpose |
|-----------|------|---------|
| Auth Logic | `backend/services/auth.service.js` | JWT generation, password hashing |
| Route Guard | `frontend/src/components/ProtectedRoute.jsx` | Frontend route protection |
| Global State | `frontend/src/context/AuthContext.jsx` | Auth state management |
| Token Refresh | `frontend/src/services/api.js` | Auto-refresh on 401 |
| DB Pool | `backend/config/db.js` | MySQL connection |
