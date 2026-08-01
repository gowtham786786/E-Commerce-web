import { Menu, Search, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminNavbar = ({ setIsMobileOpen }) => {
  const { currentUser } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-neutral-light flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30">
      
      {/* Mobile Menu Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 text-neutral-dark hover:bg-neutral-light rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-accent-light px-4 py-2 rounded-xl border border-neutral-light max-w-md w-full focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
          <Search className="w-4 h-4 text-neutral" />
          <input 
            type="text"
            placeholder="Search products, orders, customers..."
            className="bg-transparent border-none outline-none w-full text-sm text-neutral-dark placeholder:text-neutral"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        {/* Store Link */}
        <Link 
          to="/" 
          target="_blank"
          className="hidden sm:block text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          View Store
        </Link>

        {/* Notifications */}
        <button className="p-2 text-neutral hover:bg-neutral-light rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="w-px h-6 bg-neutral-light hidden sm:block"></div>

        {/* Profile */}
        <Link to="/admin/profile" className="flex items-center gap-3 hover:bg-neutral-light p-1.5 pr-3 rounded-full transition-colors">
          <img 
            src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || 'Admin')}&background=0D8ABC&color=fff`}
            alt="Profile"
            className="w-8 h-8 rounded-full border border-neutral-light object-cover"
          />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-neutral-dark leading-tight truncate max-w-[120px]">
              {currentUser?.displayName || 'Admin'}
            </p>
            <p className="text-xs text-neutral capitalize leading-tight">
              {currentUser?.role || 'admin'}
            </p>
          </div>
        </Link>

      </div>
    </header>
  );
};

export default AdminNavbar;
