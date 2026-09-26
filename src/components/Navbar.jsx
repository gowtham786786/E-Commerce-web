import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  ChevronRight, 
  Package, 
  LogOut, 
  Menu, 
  X,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useCartStore from '../store/useCartStore';
import { CATEGORIES_DATA } from '../data/categoriesData';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  const dropdownRef = useRef(null);
  const categoriesRef = useRef(null);
  
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { getTotalCount } = useCartStore();
  const cartCount = getTotalCount();

  useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.photoURL]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
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
              aria-label="Toggle Menu"
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
          <div className="hidden md:flex items-center space-x-8 text-neutral-dark font-medium">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>

            {/* Interactive Categories Dropdown */}
            <div 
              className="relative" 
              ref={categoriesRef}
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsCategoriesOpen((prev) => !prev)}
                className="flex items-center gap-1.5 hover:text-primary transition-colors py-2 focus:outline-none font-medium cursor-pointer"
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180 text-primary' : ''}`} />
              </button>

              {/* Dropdown Flyout Menu */}
              {isCategoriesOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 w-[520px] z-50">
                  <div className="bg-white rounded-3xl shadow-xl border border-neutral-200/90 p-4 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#5C6B4A]" /> All Categories
                      </span>
                      <Link
                        to="/categories"
                        onClick={() => setIsCategoriesOpen(false)}
                        className="text-xs font-bold text-[#5C6B4A] hover:underline flex items-center gap-1"
                      >
                        <span>View Page</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES_DATA.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/shop?category=${encodeURIComponent(cat.slug)}`}
                          onClick={() => setIsCategoriesOpen(false)}
                          className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#5C6B4A]/10 group transition-all"
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/60 shadow-xs">
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-neutral-900 group-hover:text-[#5C6B4A] transition-colors truncate">
                              {cat.name}
                            </p>
                            <p className="text-[11px] text-neutral-500 truncate">{cat.subtext}</p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-neutral-100 bg-neutral-50/80 -mx-4 -mb-4 p-3 px-5 flex items-center justify-between text-xs rounded-b-3xl">
                      <span className="text-neutral-500 font-medium">Over 200+ handpicked products</span>
                      <Link
                        to="/categories"
                        onClick={() => setIsCategoriesOpen(false)}
                        className="font-bold text-[#5C6B4A] hover:text-[#455037] flex items-center gap-1 bg-[#5C6B4A]/10 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <span>Explore All Categories</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                  className="flex items-center gap-1.5 hover:text-primary transition-colors focus:outline-none"
                >
                  {!avatarError && currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarError(true)}
                      className="w-7 h-7 rounded-full object-cover border border-primary/20 shadow-sm" 
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-neutral" />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-light py-2 z-50 overflow-hidden">
                    <div className="px-4 py-2 border-b border-neutral-light mb-1">
                      <p className="text-sm font-bold text-neutral-dark truncate">{currentUser.displayName || 'User'}</p>
                      <p className="text-xs text-neutral truncate">{currentUser.email}</p>
                    </div>
                    <Link 
                      to="/profile?tab=profile" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-light/50 hover:text-primary transition-colors"
                    >
                      <User className="w-4 h-4" /> Personal Info
                    </Link>
                    <Link 
                      to="/profile?tab=orders" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-light/50 hover:text-primary transition-colors"
                    >
                      <Package className="w-4 h-4" /> Your Orders
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
        <div className="md:hidden bg-white border-t border-neutral-light absolute w-full shadow-lg max-h-[80vh] overflow-y-auto z-50">
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
            
            <div className="flex flex-col space-y-3 font-medium text-neutral-dark">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary py-1">Home</Link>
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary py-1">Shop All Products</Link>
              
              {/* Mobile Categories Accordion */}
              <div className="border-t border-b border-neutral-100 py-2">
                <button
                  type="button"
                  onClick={() => setIsMobileCategoriesOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between text-left font-bold text-neutral-900 py-2"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" /> All Categories
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileCategoriesOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMobileCategoriesOpen && (
                  <div className="grid grid-cols-1 gap-2 pt-2 pb-1 pl-2">
                    {CATEGORIES_DATA.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${encodeURIComponent(cat.slug)}`}
                        onClick={() => {
                          setIsMobileCategoriesOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50"
                      >
                        <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-lg object-cover" />
                        <span className="text-sm font-semibold text-neutral-800">{cat.name}</span>
                      </Link>
                    ))}
                    <Link
                      to="/categories"
                      onClick={() => {
                        setIsMobileCategoriesOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-xs font-bold text-primary hover:underline pt-2 pl-2 flex items-center gap-1"
                    >
                      <span>Explore All Categories Page</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
