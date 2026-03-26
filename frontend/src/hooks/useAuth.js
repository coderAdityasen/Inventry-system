import { useAuth as useAuthContext } from '../context/AuthContext';

/**
 * Custom hook for authentication operations
 * Provides easy access to auth context
 */
export function useAuth() {
  const auth = useAuthContext();
  
  // Check if user has specific role
  const hasRole = (role) => {
    return auth.user?.role === role;
  };
  
  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(auth.user?.role);
  };
  
  // Check if user is admin
  const isAdmin = () => hasRole('admin');
  
  // Check if user is manager or admin
  const isManager = () => hasAnyRole(['admin', 'manager']);
  
  // Check if user is staff
  const isStaff = () => hasRole('staff');
  
  return {
    ...auth,
    hasRole,
    hasAnyRole,
    isAdmin,
    isManager,
    isStaff,
  };
}

export default useAuth;
