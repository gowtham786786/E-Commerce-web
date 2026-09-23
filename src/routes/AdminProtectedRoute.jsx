import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if user has admin role
  if (currentUser.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Enforce 2FA OTP verification
  const isOtpVerified = sessionStorage.getItem('admin_otp_verified') === 'true';
  if (!isOtpVerified) {
    return <Navigate to="/admin/verify-otp" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
