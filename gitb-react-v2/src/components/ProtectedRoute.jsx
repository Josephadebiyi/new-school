import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-neutral-100)]">
        <div className="w-12 h-12 border-4 border-t-[var(--color-primary)] border-[var(--color-neutral-200)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard based on their actual role if they try to access an unauthorized portal
    if (['admin', 'super_admin', 'sub_admin'].includes(user.role)) return <Navigate to="/admin/dashboard" replace />;
    if (['teacher', 'lecturer'].includes(user.role)) return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === 'staff') return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  // The user is authenticated and authorized; render the nested routes (the portal)
  return <Outlet />;
};

export default ProtectedRoute;
