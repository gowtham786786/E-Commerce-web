import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-dark mb-4">Access Denied</h1>
        <p className="text-neutral mb-8">
          You don't have permission to access the admin panel. If you believe this is an error, please contact support.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-xl transition-colors"
        >
          Return to Store
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
