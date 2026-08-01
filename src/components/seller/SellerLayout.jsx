import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Store, Package, ShoppingCart, LogOut, LayoutDashboard } from 'lucide-react';

const SellerLayout = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/seller', icon: LayoutDashboard },
    { name: 'My Products', path: '/seller/products', icon: Package },
    { name: 'Orders', path: '/seller/orders', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-accent flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-light flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-neutral-light">
          <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <Store className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight text-neutral-dark">Seller<span className="text-primary">Hub</span></span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-neutral hover:bg-neutral-light hover:text-neutral-dark'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-neutral'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-light">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
