import { Link, useLocation } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingCart, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Bell,
  BarChart,
  Tag,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Categories', path: '/admin/categories', icon: Layers },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Inventory', path: '/admin/inventory', icon: FileText },
  { name: 'Coupons', path: '/admin/coupons', icon: Tag },
  { name: 'Payments', path: '/admin/payments', icon: CreditCard },
  { name: 'Reviews', path: '/admin/reviews', icon: Star },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart },
  { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminSidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      if (currentUser?.uid) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          otpVerified: false
        });
      }
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? '80px' : '260px',
          x: isMobileOpen ? 0 : (window.innerWidth < 768 ? '-100%' : 0)
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed md:static inset-y-0 left-0 z-50 bg-white border-r border-neutral-light flex flex-col h-screen"
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-light shrink-0">
          {!isCollapsed && (
            <Link to="/admin" className="text-xl font-bold text-primary truncate">
              ShopMate Admin
            </Link>
          )}
          {isCollapsed && (
             <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold">
               S
             </div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-neutral-light hover:bg-neutral text-neutral-dark transition-colors absolute -right-4 border border-neutral-light"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-neutral hover:bg-neutral-light hover:text-neutral-dark'
                }`}
                title={isCollapsed ? item.name : undefined}
                onClick={() => window.innerWidth < 768 && setIsMobileOpen(false)}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-neutral'}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-neutral-light shrink-0">
           <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;
