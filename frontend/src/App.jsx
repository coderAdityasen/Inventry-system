import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import InventoryList from './pages/inventory/InventoryList';
import InventoryForm from './pages/inventory/InventoryForm';
import InventoryDetails from './pages/inventory/InventoryDetails';
import SupplierList from './pages/suppliers/SupplierList';
import SupplierForm from './pages/suppliers/SupplierForm';
import SupplierDetails from './pages/suppliers/SupplierDetails';
import CategoryList from './pages/categories/CategoryList';
import CategoryForm from './pages/categories/CategoryForm';
import CategoryDetails from './pages/categories/CategoryDetails';

/**
 * Main App Component
 * Wraps all routes with AuthProvider for global auth state
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Inventory Routes */}
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute>
                <InventoryList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory/new" 
            element={
              <ProtectedRoute>
                <InventoryForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory/:id" 
            element={
              <ProtectedRoute>
                <InventoryDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory/:id/edit" 
            element={
              <ProtectedRoute>
                <InventoryForm />
              </ProtectedRoute>
            } 
          />
          
          {/* Supplier Routes */}
          <Route 
            path="/suppliers" 
            element={
              <ProtectedRoute>
                <SupplierList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/suppliers/new" 
            element={
              <ProtectedRoute>
                <SupplierForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/suppliers/:id" 
            element={
              <ProtectedRoute>
                <SupplierDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/suppliers/:id/edit" 
            element={
              <ProtectedRoute>
                <SupplierForm />
              </ProtectedRoute>
            } 
          />
          
          {/* Category Routes */}
          <Route 
            path="/categories" 
            element={
              <ProtectedRoute>
                <CategoryList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/categories/new" 
            element={
              <ProtectedRoute>
                <CategoryForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/categories/:id" 
            element={
              <ProtectedRoute>
                <CategoryDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/categories/:id/edit" 
            element={
              <ProtectedRoute>
                <CategoryForm />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
