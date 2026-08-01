import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const SellerRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (currentUser.role !== 'seller' && currentUser.role !== 'admin' && !currentUser.isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default SellerRoute;
