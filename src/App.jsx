import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import LoginOtp from './pages/LoginOtp';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import OrderConfirmation from './pages/OrderConfirmation';
import ProtectedRoute from './components/ProtectedRoute';
import Wishlist from './pages/Wishlist';
import PageTransition from './components/PageTransition';

// Admin Imports
import AdminProtectedRoute from './routes/AdminProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import VerifyOTP from './pages/admin/VerifyOTP';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import Customers from './pages/admin/Customers';
import Inventory from './pages/admin/Inventory';
import Payments from './pages/admin/Payments';
import Reviews from './pages/admin/Reviews';
import Analytics from './pages/admin/Analytics';
import Notifications from './pages/admin/Notifications';
import Coupons from './pages/admin/Coupons';
import Settings from './pages/admin/Settings';
import AdminProfile from './pages/admin/Profile';
import Unauthorized from './pages/Unauthorized';

// Seller Imports
import SellerRoute from './components/seller/SellerRoute';
import SellerLayout from './components/seller/SellerLayout';
import SellerDashboard from './pages/seller/SellerDashboard';

const AdminAnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition title="Dashboard"><Dashboard /></PageTransition>} />
        <Route path="/products" element={<PageTransition title="Products"><Products /></PageTransition>} />
        <Route path="/products/add" element={<PageTransition title="Add Product"><AddProduct /></PageTransition>} />
        <Route path="/products/edit/:id" element={<PageTransition title="Edit Product"><EditProduct /></PageTransition>} />
        <Route path="/categories" element={<PageTransition title="Categories"><Categories /></PageTransition>} />
        <Route path="/orders" element={<PageTransition title="Orders"><Orders /></PageTransition>} />
        <Route path="/customers" element={<PageTransition title="Customers"><Customers /></PageTransition>} />
        <Route path="/inventory" element={<PageTransition title="Inventory"><Inventory /></PageTransition>} />
        <Route path="/payments" element={<PageTransition title="Payments"><Payments /></PageTransition>} />
        <Route path="/reviews" element={<PageTransition title="Reviews"><Reviews /></PageTransition>} />
        <Route path="/analytics" element={<PageTransition title="Analytics"><Analytics /></PageTransition>} />
        <Route path="/notifications" element={<PageTransition title="Notifications"><Notifications /></PageTransition>} />
        <Route path="/coupons" element={<PageTransition title="Coupons"><Coupons /></PageTransition>} />
        <Route path="/settings" element={<PageTransition title="Settings"><Settings /></PageTransition>} />
        <Route path="/profile" element={<PageTransition title="Profile"><AdminProfile /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const SellerAnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition title="Seller Dashboard"><SellerDashboard /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition title="Home"><Home /></PageTransition>} />
        <Route path="/shop" element={<PageTransition title="Shop"><Shop /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition title="Product"><ProductDetail /></PageTransition>} />
        <Route path="/cart" element={<PageTransition title="Cart"><Cart /></PageTransition>} />
        <Route path="/wishlist" element={<PageTransition title="Wishlist"><Wishlist /></PageTransition>} />
        <Route path="/login" element={<PageTransition title="Log In"><Login /></PageTransition>} />
        <Route path="/login-otp" element={<PageTransition title="Log In with OTP"><LoginOtp /></PageTransition>} />
        <Route path="/signup" element={<PageTransition title="Sign Up"><Signup /></PageTransition>} />
        
        {/* Protected Routes */}
        <Route path="/checkout" element={<ProtectedRoute><PageTransition title="Checkout"><Checkout /></PageTransition></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageTransition title="My Profile"><Profile /></PageTransition></ProtectedRoute>} />
        <Route path="/order-confirmation" element={<ProtectedRoute><PageTransition title="Order Confirmed"><OrderConfirmation /></PageTransition></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const location = useLocation();
  
  // Hide main Navbar and Footer on admin, seller, and unauthorized routes
  const isDashboardRoute = location.pathname.startsWith('/admin') || 
                           location.pathname.startsWith('/seller') ||
                           location.pathname === '/unauthorized';

  return (
    <div className="flex flex-col min-h-screen">
      {!isDashboardRoute && <Navbar />}
      
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/verify-otp" element={<VerifyOTP />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route path="/admin/*" element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminAnimatedRoutes />
              </AdminLayout>
            </AdminProtectedRoute>
          } />
          
          <Route path="/seller/*" element={
            <SellerRoute>
              <SellerLayout>
                <SellerAnimatedRoutes />
              </SellerLayout>
            </SellerRoute>
          } />
          
          <Route path="*" element={<AnimatedRoutes />} />
        </Routes>
      </main>
      
      {!isDashboardRoute && <Footer />}
    </div>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
