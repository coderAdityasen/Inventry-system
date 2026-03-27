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
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
