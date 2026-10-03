import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// UX affordance only — hides admin-only routes from non-admins in the UI so
// they aren't sent through a form that will always fail. This is NOT the
// security boundary: the server enforces admin-only access on every
// admin route via requireRole('admin'), independent of this component.
const RequireAdmin = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
