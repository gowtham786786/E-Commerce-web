import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Heart, ShoppingCart, User, ChevronDown, Package, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useCartStore from '../store/useCartStore';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { getTotalCount } = useCartStore();
  const cartCount = getTotalCount();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };
  return (
    <nav className="bg-accent sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-neutral-dark hover:text-primary transition-colors p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl sm:text-2xl ml-2 md:ml-0 flex-1 md:flex-none">
            <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" />
            <span>ShopMate</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8 text-neutral-dark font-medium">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <Link to="/shop" className="hover:text-primary transition-colors">Categories</Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-5 text-neutral-dark">
            <form onSubmit={handleSearch} className="relative hidden lg:block">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-1.5 rounded-full border border-neutral-light bg-accent-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm w-40 xl:w-48 transition-all"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral" />
            </form>
            <Link to="/wishlist" className="hover:text-primary transition-colors" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="relative hover:text-primary transition-colors" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 hover:text-primary transition-colors focus:outline-none"
                >
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-neutral-light" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-light py-2 z-50 overflow-hidden">
                    <div className="px-4 py-2 border-b border-neutral-light mb-1">
                      <p className="text-sm font-bold text-neutral-dark truncate">{currentUser.displayName || 'User'}</p>
                      <p className="text-xs text-neutral truncate">{currentUser.email}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-light/50 hover:text-primary transition-colors"
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link 
                      to="/profile" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-light/50 hover:text-primary transition-colors"
                    >
                      <Package className="w-4 h-4" /> Orders
                    </Link>
                    <button 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors mt-1 border-t border-neutral-light/50 pt-3 disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" /> {isLoggingOut ? 'Logging out...' : 'Log out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hover:text-primary transition-colors font-medium text-sm flex items-center gap-1">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Log in</span>
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-light absolute w-full shadow-lg">
          <div className="px-4 py-6 space-y-4">
            <form onSubmit={handleSearch} className="relative mb-6">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-light bg-accent-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral" />
            </form>
            
            <div className="flex flex-col space-y-4 font-medium text-neutral-dark">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)}>Categories</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
