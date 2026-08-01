import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if user has admin role
  if (currentUser.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if OTP is verified (server-backed via Firestore user doc)
  // We use !== true so that undefined/missing fields also count as false
  if (currentUser.otpVerified !== true) {
    return <Navigate to="/admin/verify-otp" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
