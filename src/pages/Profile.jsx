import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabase';
import { formatCurrency, convertUsdToInr } from '../utils/formatCurrency';
import useWishlistStore from '../store/useWishlistStore';
import useCartStore from '../store/useCartStore';
import {
  User,
  MapPin,
  Package,
  LogOut,
  Truck,
  CreditCard,
  Heart,
  Gift,
  HelpCircle,
  CheckCircle2,
  Clock,
  Copy,
  Edit3,
  Trash2,
  Plus,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Award,
  ShoppingBag,
  Search,
  AlertCircle,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  ExternalLink,
  RotateCcw,
  Lock,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'orders', label: 'Your Orders', icon: Package },
  { id: 'profile', label: 'Personal Info', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'wallet', label: 'Coins & Wallet', icon: CreditCard },
  { id: 'coupons', label: 'Coupons & Offers', icon: Gift },
  { id: 'support', label: '24x7 Help Desk', icon: HelpCircle },
];

const AVAILABLE_COUPONS = [
  {
    code: 'WELCOME10',
    title: '10% Instant Discount',
    description: 'Valid on your first purchase storewide.',
    discount: '10% OFF',
    minOrder: 'No min. value',
    expiry: 'Valid till 31 Dec 2026',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    code: 'SHOPMATE50',
    title: 'Flat 50% Off Fashion & Essentials',
    description: 'Save big on selected clothing and lifestyle products.',
    discount: '50% OFF',
    minOrder: 'Min. order ₹999',
    expiry: 'Limited Time Offer',
    color: 'from-amber-500 to-orange-600',
  },
  {
    code: 'FREESHIP',
    title: 'Zero Delivery Fee',
    description: 'Enjoy free express priority delivery straight to your doorstep.',
    discount: 'FREE DELIVERY',
    minOrder: 'On all orders',
    expiry: 'Valid all year',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    code: 'FESTIVE500',
    title: 'Flat ₹500 Instant Cashback',
    description: 'Applicable on Electronics and Home appliances.',
    discount: '₹500 OFF',
    minOrder: 'Min. order ₹2,999',
    expiry: 'Expires in 7 days',
    color: 'from-purple-500 to-rose-600',
  },
];

const Profile = () => {
  const { currentUser, loading, logout, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: wishlistItems } = useWishlistStore();
  const { addItem } = useCartStore();

  const urlTab = searchParams.get('tab');
  const validTabIds = TABS.map((t) => t.id);
  const [activeTab, setActiveTab] = useState(
    urlTab && validTabIds.includes(urlTab) ? urlTab : 'orders'
  );
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (urlTab && validTabIds.includes(urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.photoURL]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    phone: '',
    gender: 'male',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Account Password Management State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Address Management State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    pincode: '',
    street: '',
    city: '',
    state: '',
    country: 'India',
    type: 'Home',
    isDefault: false,
  });

  const [copiedCoupon, setCopiedCoupon] = useState('');

  // 1. Initial Profile Setup
  useEffect(() => {
    if (currentUser) {
      const uid = currentUser.id || currentUser.uid;
      const storedGender = uid ? localStorage.getItem(`shopmate_gender_${uid}`) : null;
      setProfileData({
        displayName: currentUser.displayName || currentUser.name || '',
        phone: currentUser.phone || '',
        gender: currentUser.gender || storedGender || 'male',
      });

      // Load saved addresses from localStorage or default
      const storageKey = `shopmate_addresses_${uid}`;
      const localAddresses = localStorage.getItem(storageKey);

      if (localAddresses) {
        try {
          setSavedAddresses(JSON.parse(localAddresses));
        } catch {
          setSavedAddresses([]);
        }
      } else if (currentUser.addresses && currentUser.addresses.length > 0) {
        setSavedAddresses(currentUser.addresses);
      }
    }
  }, [currentUser]);

  // 2. Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      const uid = currentUser?.id || currentUser?.uid;
      if (!uid) return;
      try {
        const { data: ordersData, error: ordersErr } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', uid)
          .order('created_at', { ascending: false });

        if (ordersErr) throw ordersErr;

        setOrders(ordersData || []);

        // If no addresses in localStorage yet, extract shipping address from latest order
        const storageKey = `shopmate_addresses_${uid}`;
        if (!localStorage.getItem(storageKey) && ordersData && ordersData.length > 0) {
          const firstOrder = ordersData[0];
          if (firstOrder.shipping_address) {
            const initialAddr = {
              name: currentUser.displayName || 'Primary Address',
              phone: currentUser.phone || '',
              pincode: firstOrder.shipping_address.zip || '',
              street: firstOrder.shipping_address.street || '',
              city: firstOrder.shipping_address.city || '',
              state: firstOrder.shipping_address.state || '',
              country: firstOrder.shipping_address.country || 'India',
              type: 'Home',
              isDefault: true,
            };
            setSavedAddresses([initialAddr]);
            localStorage.setItem(storageKey, JSON.stringify([initialAddr]));
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  // Helper to persist addresses
  const saveAddressesToStorage = (newList) => {
    setSavedAddresses(newList);
    const uid = currentUser?.id || currentUser?.uid;
    if (uid) {
      localStorage.setItem(`shopmate_addresses_${uid}`, JSON.stringify(newList));
      if (currentUser) {
        currentUser.addresses = newList;
      }
    }
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const uid = currentUser?.id || currentUser?.uid;
    try {
      if (uid) {
        // 1. Update Supabase public.profiles table (matches DB columns: display_name, phone)
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: uid,
            email: currentUser.email,
            display_name: profileData.displayName,
            phone: profileData.phone,
          }, { onConflict: 'id' });

        if (error) throw error;

        // 2. Persist gender in Supabase Auth user_metadata
        try {
          await supabase.auth.updateUser({
            data: {
              displayName: profileData.displayName,
              full_name: profileData.displayName,
              phone: profileData.phone,
              gender: profileData.gender,
            }
          });
        } catch (authErr) {
          console.warn("Auth user_metadata update notice:", authErr);
        }

        // 3. Persist gender in localStorage for this user
        localStorage.setItem(`shopmate_gender_${uid}`, profileData.gender);

        currentUser.displayName = profileData.displayName;
        currentUser.phone = profileData.phone;
        currentUser.gender = profileData.gender;

        if (updateCurrentUser) {
          updateCurrentUser({
            displayName: profileData.displayName,
            phone: profileData.phone,
            gender: profileData.gender,
          });
        }

        toast.success('Profile updated successfully!');
        setIsEditingProfile(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Set / Change Account Password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long.');
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match. Please re-enter.');
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast.success('Password set successfully! You can now log in using either Google or your email and password.');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (err) {
      console.error('Error setting password:', err);
      toast.error(err.message || 'Failed to set password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Add / Edit Address
  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.pincode) {
      return toast.error('Please complete all mandatory address fields');
    }

    let updatedList = [...savedAddresses];

    if (addressForm.isDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }

    if (editingAddressIndex !== null) {
      updatedList[editingAddressIndex] = addressForm;
      toast.success('Address updated successfully!');
    } else {
      const isFirst = updatedList.length === 0;
      updatedList.push({
        ...addressForm,
        isDefault: isFirst ? true : addressForm.isDefault,
      });
      toast.success('New address added to your address book!');
    }

    saveAddressesToStorage(updatedList);
    setIsAddingAddress(false);
    setEditingAddressIndex(null);
    setAddressForm({
      name: '',
      phone: '',
      pincode: '',
      street: '',
      city: '',
      state: '',
      country: 'India',
      type: 'Home',
      isDefault: false,
    });
  };

  const handleEditAddress = (idx) => {
    setEditingAddressIndex(idx);
    setAddressForm(savedAddresses[idx]);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = (idx) => {
    const updated = savedAddresses.filter((_, i) => i !== idx);
    if (updated.length > 0 && savedAddresses[idx].isDefault) {
      updated[0].isDefault = true;
    }
    saveAddressesToStorage(updated);
    toast.success('Address removed from address book');
  };

  const handleSetDefaultAddress = (idx) => {
    const updated = savedAddresses.map((addr, i) => ({
      ...addr,
      isDefault: i === idx,
    }));
    saveAddressesToStorage(updated);
    toast.success('Default delivery address updated!');
  };

  // Copy coupon
  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCoupon(''), 3000);
  };

  // Buy Again handler
  const handleBuyAgain = (item) => {
    addItem({
      id: item.productId || item.id,
      name: item.name,
      price: item.price,
      images: [item.image],
      quantity: 1,
    });
    toast.success(`Added "${item.name}" to cart!`);
    navigate('/cart');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Format Order Date
  const formatOrderDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  // Delivery estimation
  const getDeliveryDate = (dateStr) => {
    if (!dateStr) return 'in 3-4 business days';
    try {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + 4);
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'in 3-4 business days';
    }
  };

  // Safe Avatar Initial Generator
  const userDisplayName = currentUser?.displayName || currentUser?.name || currentUser?.email?.split('@')[0] || 'User';
  const userInitials = userDisplayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SM';

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'delivered' && order.status !== 'delivered') return false;
    if (orderFilter === 'pending' && order.status === 'delivered') return false;
    if (orderFilter === 'cancelled' && order.status !== 'cancelled') return false;
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matchId = order.id?.toLowerCase().includes(q);
      const matchItem = order.items?.some((it) => it.name?.toLowerCase().includes(q));
      return matchId || matchItem;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-10 h-10 border-4 border-[#5C6B4A]/30 border-t-[#5C6B4A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* 1. AMAZON & FLIPKART STYLE HERO HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#3e4832] via-[#5C6B4A] to-[#6d7e58] text-white py-10 shadow-md relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-white/5 rounded-full pointer-events-none blur-2xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-black/10 rounded-full pointer-events-none blur-xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* User Profile Card */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              {/* Avatar with fallback */}
              <div className="relative">
                {!avatarError && currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={userDisplayName}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/30 text-white font-extrabold text-2xl flex items-center justify-center shadow-xl">
                    {userInitials}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1.5 rounded-full shadow-md border-2 border-white" title="Verified Customer">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>

              {/* Identity & Badges */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {userDisplayName}
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-200 border border-amber-400/40 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    ShopMate Plus Member
                  </span>
                </div>

                <p className="text-white/80 text-sm flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-4 h-4 text-white/60" />
                  <span>{currentUser.email}</span>
                </p>

                {currentUser.phone && (
                  <p className="text-white/80 text-xs flex items-center justify-center sm:justify-start gap-2">
                    <Phone className="w-3.5 h-3.5 text-white/60" />
                    <span>{currentUser.phone}</span>
                  </p>
                )}

                <div className="pt-2 flex items-center justify-center sm:justify-start gap-2 text-[11px] text-white/70">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Verified via {currentUser.provider === 'google' ? 'Google Account' : 'Secure Email'}</span>
                  <span>&bull;</span>
                  <span>Customer ID: #{String(currentUser.id || '').slice(0, 8)}</span>
                </div>
              </div>
            </div>

            {/* Quick Stat Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              <div
                onClick={() => handleTabChange('orders')}
                className="bg-white/10 hover:bg-white/15 cursor-pointer backdrop-blur-md rounded-2xl p-3 text-center border border-white/10 transition-all hover:scale-105"
              >
                <span className="block text-2xl font-black text-white">{orders.length}</span>
                <span className="text-[11px] font-medium text-white/80 uppercase tracking-wider">Orders</span>
              </div>

              <Link
                to="/wishlist"
                className="bg-white/10 hover:bg-white/15 cursor-pointer backdrop-blur-md rounded-2xl p-3 text-center border border-white/10 transition-all hover:scale-105"
              >
                <span className="block text-2xl font-black text-rose-300">{wishlistItems.length}</span>
                <span className="text-[11px] font-medium text-white/80 uppercase tracking-wider">Wishlist</span>
              </Link>

              <div
                onClick={() => handleTabChange('wallet')}
                className="bg-white/10 hover:bg-white/15 cursor-pointer backdrop-blur-md rounded-2xl p-3 text-center border border-white/10 transition-all hover:scale-105"
              >
                <span className="block text-2xl font-black text-amber-300">250</span>
                <span className="text-[11px] font-medium text-white/80 uppercase tracking-wider">SuperCoins</span>
              </div>

              <div
                onClick={() => handleTabChange('addresses')}
                className="bg-white/10 hover:bg-white/15 cursor-pointer backdrop-blur-md rounded-2xl p-3 text-center border border-white/10 transition-all hover:scale-105"
              >
                <span className="block text-2xl font-black text-white">{savedAddresses.length}</span>
                <span className="text-[11px] font-medium text-white/80 uppercase tracking-wider">Addresses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTAINER WITH SIDEBAR & ACTIVE VIEW (NO OVERLAP / ZERO COLLISION) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: AMAZON & FLIPKART STYLE MASTER NAVIGATION */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            <div className="bg-white rounded-3xl shadow-sm border border-neutral-200/80 overflow-hidden">
              <div className="p-4 bg-neutral-50/80 border-b border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Account Dashboard</span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Active</span>
              </div>

              <nav className="p-2 space-y-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-[#5C6B4A] text-white shadow-md shadow-[#5C6B4A]/25 translate-x-1'
                          : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#5C6B4A]'}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.id === 'orders' && orders.length > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-800'}`}>
                          {orders.length}
                        </span>
                      )}
                      {tab.id === 'coupons' && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-amber-400 text-neutral-900' : 'bg-amber-100 text-amber-800'}`}>
                          4 LIVE
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white opacity-80' : 'text-neutral-400'}`} />
                    </button>
                  );
                })}

                {/* Integrated VIP Loyalty Badge */}
                <div className="pt-2 px-1">
                  <div
                    onClick={() => handleTabChange('wallet')}
                    className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between cursor-pointer hover:border-amber-300 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-sm">
                        <Award className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-neutral-900">250 SuperCoins</span>
                        <span className="block text-[10px] text-amber-800 font-medium">Redeem at checkout</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-neutral-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl font-semibold text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Log Out from Account</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* RIGHT VIEW AREA: ACCORDING TO ACTIVE TAB */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* ========================================================= */}
            {/* TAB 1: YOUR ORDERS (AMAZON STYLE) */}
            {/* ========================================================= */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl shadow-sm border border-neutral-200/80 p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-neutral-dark flex items-center gap-2.5">
                      <Package className="w-7 h-7 text-[#5C6B4A]" />
                      <span>Your Orders</span>
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      Track packages, initiate returns, or buy everyday essentials again.
                    </p>
                  </div>

                  {/* Order Search Filter */}
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Search orders by item..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A]"
                    />
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  {['all', 'pending', 'delivered', 'cancelled'].map((filterKey) => (
                    <button
                      key={filterKey}
                      onClick={() => setOrderFilter(filterKey)}
                      className={`px-3.5 py-1.5 rounded-full font-bold capitalize transition-colors ${
                        orderFilter === filterKey
                          ? 'bg-[#5C6B4A] text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {filterKey === 'all' ? 'All Orders' : filterKey}
                    </button>
                  ))}
                </div>

                {/* Orders Content */}
                {loadingOrders ? (
                  <div className="py-20 text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-[#5C6B4A]/20 border-t-[#5C6B4A] rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-medium text-neutral-500">Retrieving your order records...</p>
                  </div>
                ) : filteredOrders.length > 0 ? (
                  <div className="space-y-6">
                    {filteredOrders.map((order) => {
                      const totalFormatted =
                        order.total > 500
                          ? formatCurrency(order.total)
                          : formatCurrency(convertUsdToInr(order.total));

                      const isDelivered = order.status === 'delivered';
                      const isShipped = order.status === 'shipped';

                      return (
                        <div
                          key={order.id}
                          className="border border-neutral-200 rounded-3xl overflow-hidden hover:border-[#5C6B4A]/40 transition-all hover:shadow-md bg-white"
                        >
                          {/* Amazon-style Card Header Bar */}
                          <div className="bg-neutral-50/80 px-6 py-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                            <div className="flex flex-wrap items-center gap-6">
                              <div>
                                <span className="block text-neutral-400 uppercase font-bold text-[10px]">Order Placed</span>
                                <span className="font-semibold text-neutral-800">{formatOrderDate(order.created_at)}</span>
                              </div>
                              <div>
                                <span className="block text-neutral-400 uppercase font-bold text-[10px]">Total Amount</span>
                                <span className="font-extrabold text-neutral-900 text-sm">{totalFormatted}</span>
                              </div>
                              <div>
                                <span className="block text-neutral-400 uppercase font-bold text-[10px]">Ship To</span>
                                <span className="font-semibold text-neutral-800 truncate max-w-[140px] block">
                                  {order.shipping_address?.street || userDisplayName}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-neutral-500 font-mono">#{order.id.slice(0, 12)}</span>
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                  isDelivered
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isShipped
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {order.status || 'Confirmed'}
                              </span>
                            </div>
                          </div>

                          {/* Order Body */}
                          <div className="p-6 space-y-6">
                            {/* Live Delivery Status Tracker */}
                            <div className="bg-[#F9FAF7] rounded-2xl p-4 border border-neutral-200/60">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                                  <Truck className="w-4 h-4 text-[#5C6B4A]" />
                                  {isDelivered
                                    ? 'Delivered to your address'
                                    : `Arriving by ${getDeliveryDate(order.created_at)}`}
                                </span>
                                <span className="text-[11px] font-semibold text-[#5C6B4A]">
                                  {isDelivered ? 'Delivery Complete' : 'Standard Express'}
                                </span>
                              </div>

                              {/* Progress Track */}
                              <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden mt-3">
                                <div
                                  className="bg-[#5C6B4A] h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: isDelivered ? '100%' : isShipped ? '66%' : '33%',
                                  }}
                                />
                              </div>
                              <div className="flex justify-between text-[10px] text-neutral-500 font-semibold mt-1.5">
                                <span className="text-[#5C6B4A]">Order Confirmed</span>
                                <span className={isShipped || isDelivered ? 'text-[#5C6B4A]' : ''}>Shipped</span>
                                <span className={isDelivered ? 'text-[#5C6B4A]' : ''}>Delivered</span>
                              </div>
                            </div>

                            {/* Ordered Items List */}
                            <div className="divide-y divide-neutral-100">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                                  <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0 p-1">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80';
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-sm text-neutral-900 hover:text-[#5C6B4A] cursor-pointer">
                                        {item.name}
                                      </h4>
                                      <p className="text-xs text-neutral-500 mt-0.5">
                                        Qty: {item.quantity} &bull; Price: {formatCurrency(item.price)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    <button
                                      onClick={() => handleBuyAgain(item)}
                                      className="px-4 py-2 bg-[#5C6B4A] hover:bg-[#48543a] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      <span>Buy It Again</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 bg-neutral-100 text-[#5C6B4A] rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-800">No orders found</h3>
                    <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                      Looks like you haven't placed an order yet. Explore our verified seasonal collection with guaranteed doorstep delivery!
                    </p>
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 bg-[#5C6B4A] hover:bg-[#4a563b] text-white font-bold px-7 py-3 rounded-2xl shadow-md transition-all hover:scale-105"
                    >
                      <span>Explore Catalog</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: PERSONAL INFORMATION & PROFILE EDIT (FLIPKART STYLE) */}
            {/* ========================================================= */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl shadow-sm border border-neutral-200/80 p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
                  <div>
                    <h2 className="text-2xl font-black text-neutral-dark flex items-center gap-2.5">
                      <User className="w-7 h-7 text-[#5C6B4A]" />
                      <span>Personal Information</span>
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1">Manage your identity, contact details, and account security.</p>
                  </div>

                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 border border-[#5C6B4A] text-[#5C6B4A] hover:bg-[#5C6B4A] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Name field */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        disabled={!isEditingProfile}
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-800 disabled:bg-neutral-50 focus:bg-white focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                        Mobile Phone Number
                      </label>
                      <input
                        type="tel"
                        disabled={!isEditingProfile}
                        placeholder="+91 98765 43210"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-800 disabled:bg-neutral-50 focus:bg-white focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A]"
                      />
                    </div>
                  </div>

                  {/* Gender selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                      Your Gender
                    </label>
                    <div className="flex items-center gap-6">
                      {['male', 'female', 'other'].map((g) => (
                        <label key={g} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-neutral-700 capitalize">
                          <input
                            type="radio"
                            name="gender"
                            disabled={!isEditingProfile}
                            checked={profileData.gender === g}
                            onChange={() => setProfileData({ ...profileData, gender: g })}
                            className="text-[#5C6B4A] focus:ring-[#5C6B4A]"
                          />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Email (Readonly) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                      Registered Email Address
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-100 text-sm font-semibold text-neutral-500 cursor-not-allowed"
                      />
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" /> Verified
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  {isEditingProfile && (
                    <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-6 py-2.5 bg-[#5C6B4A] hover:bg-[#48543a] text-white font-bold text-sm rounded-xl transition-all shadow-md disabled:opacity-50"
                      >
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-sm rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>

                {/* ========================================== */}
                {/* ACCOUNT SECURITY & PASSWORD (GOOGLE LOGIN) */}
                {/* ========================================== */}
                <div className="pt-6 border-t border-neutral-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-neutral-dark flex items-center gap-2">
                        <Lock className="w-5 h-5 text-[#5C6B4A]" />
                        <span>Account Security & Password</span>
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Manage login credentials and password for your account.
                      </p>
                    </div>

                    {!isChangingPassword && (
                      <button
                        type="button"
                        onClick={() => setIsChangingPassword(true)}
                        className="px-4 py-2 border border-[#5C6B4A] text-[#5C6B4A] hover:bg-[#5C6B4A] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Set / Change Password</span>
                      </button>
                    )}
                  </div>

                  {/* Google OAuth Explanation Banner */}
                  <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 text-xs text-neutral-700 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>How Google Sign-In Works</span>
                    </div>
                    <p className="text-neutral-600 leading-relaxed">
                      You are signed in via <strong>Google Account ({currentUser.email})</strong>. Google verifies your identity securely without requiring a separate password.
                    </p>
                    <div className="bg-white/80 rounded-xl p-3 border border-emerald-100 space-y-1">
                      <p className="font-bold text-neutral-800">Next time you log in:</p>
                      <ul className="list-disc list-inside text-neutral-600 space-y-0.5">
                        <li><strong>Method 1:</strong> Simply click <strong>"Continue with Google"</strong> on the Login page — you will be logged in instantly in 1 click (no password needed).</li>
                        <li><strong>Method 2:</strong> Set an account password below if you also want to log in by typing your <strong>Email & Password</strong> directly.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Password Form (when opened) */}
                  {isChangingPassword && (
                    <form onSubmit={handleSavePassword} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                            New Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              minLength={6}
                              placeholder="Minimum 6 characters"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-neutral-200 bg-white text-sm font-semibold focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                            Confirm New Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              required
                              minLength={6}
                              placeholder="Re-enter your password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-neutral-200 bg-white text-sm font-semibold focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={savingPassword}
                          className="px-6 py-2.5 bg-[#5C6B4A] hover:bg-[#4a583c] text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>{savingPassword ? 'Setting Password...' : 'Save Account Password'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingPassword(false);
                            setPasswordForm({ newPassword: '', confirmPassword: '' });
                          }}
                          className="px-4 py-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-semibold text-xs rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: MANAGE ADDRESSES (FLIPKART STYLE) */}
            {/* ========================================================= */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl shadow-sm border border-neutral-200/80 p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
                  <div>
                    <h2 className="text-2xl font-black text-neutral-dark flex items-center gap-2.5">
                      <MapPin className="w-7 h-7 text-[#5C6B4A]" />
                      <span>Manage Delivery Addresses</span>
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1">Saved addresses for lightning-fast 1-click checkout.</p>
                  </div>

                  {!isAddingAddress && (
                    <button
                      onClick={() => {
                        setIsAddingAddress(true);
                        setEditingAddressIndex(null);
                        setAddressForm({
                          name: userDisplayName,
                          phone: currentUser.phone || '',
                          pincode: '',
                          street: '',
                          city: '',
                          state: '',
                          country: 'India',
                          type: 'Home',
                          isDefault: savedAddresses.length === 0,
                        });
                      }}
                      className="px-4 py-2 bg-[#5C6B4A] hover:bg-[#49553b] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Address</span>
                    </button>
                  )}
                </div>

                {/* Add / Edit Form Modal/Drawer */}
                {isAddingAddress && (
                  <form onSubmit={handleSaveAddress} className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 space-y-4">
                    <h3 className="font-bold text-sm text-neutral-800 uppercase tracking-wider mb-2">
                      {editingAddressIndex !== null ? 'Edit Address' : 'Add New Delivery Address'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Harsha Naidu"
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-600 mb-1">10-Digit Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="9876543210"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-600 mb-1">Pincode *</label>
                        <input
                          type="text"
                          required
                          placeholder="522502"
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-600 mb-1">City / District *</label>
                        <input
                          type="text"
                          required
                          placeholder="Vijayawada"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-600 mb-1">State *</label>
                        <input
                          type="text"
                          required
                          placeholder="Andhra Pradesh"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Flat, House no., Building, Street *</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Flat 402, Green Meadows, 5th Cross Road"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-sm"
                      />
                    </div>

                    {/* Address Type */}
                    <div className="flex flex-wrap items-center gap-6 pt-2">
                      <span className="text-xs font-bold text-neutral-600">Address Type:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                        <input
                          type="radio"
                          name="addrType"
                          checked={addressForm.type === 'Home'}
                          onChange={() => setAddressForm({ ...addressForm, type: 'Home' })}
                          className="text-[#5C6B4A]"
                        />
                        <span>Home (All-Day Delivery)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                        <input
                          type="radio"
                          name="addrType"
                          checked={addressForm.type === 'Work'}
                          onChange={() => setAddressForm({ ...addressForm, type: 'Work' })}
                          className="text-[#5C6B4A]"
                        />
                        <span>Work (Delivery between 10 AM - 5 PM)</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#5C6B4A] hover:bg-[#4a573b] text-white font-bold text-sm rounded-xl shadow-md transition-all"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-4 py-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-sm font-semibold rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Saved Address Cards */}
                {savedAddresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl border transition-all ${
                          addr.isDefault
                            ? 'border-[#5C6B4A] bg-[#F7F9F4] ring-1 ring-[#5C6B4A]/30'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700 tracking-wider">
                            {addr.type || 'Home'}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#5C6B4A] text-white tracking-wider">
                              Default
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-sm text-neutral-900">{addr.name || userDisplayName}</h4>
                        <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                          {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        {addr.phone && (
                          <p className="text-xs text-neutral-500 font-semibold mt-1">
                            Phone: {addr.phone}
                          </p>
                        )}

                        <div className="flex items-center gap-3 pt-4 mt-3 border-t border-neutral-200/60 text-xs font-bold">
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(idx)}
                              className="text-[#5C6B4A] hover:underline"
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            onClick={() => handleEditAddress(idx)}
                            className="text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(idx)}
                            className="text-rose-600 hover:text-rose-800 flex items-center gap-1 ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-neutral-500 text-sm">
                    No addresses saved yet. Click "Add New Address" above to save your first delivery location!
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: COINS & WALLET (FLIPKART SUPERCOINS STYLE) */}
            {/* ========================================================= */}
            {activeTab === 'wallet' && (
              <div className="bg-white rounded-3xl shadow-sm border border-neutral-200/80 p-6 md:p-8 space-y-6">
                <div className="pb-6 border-b border-neutral-200">
                  <h2 className="text-2xl font-black text-neutral-dark flex items-center gap-2.5">
                    <CreditCard className="w-7 h-7 text-[#5C6B4A]" />
                    <span>ShopMate Coins & Wallet</span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">Earn SuperCoins on every purchase and redeem for instant discounts.</p>
                </div>

                {/* Coin Hero Balance Card */}
                <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-6 text-white shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-100">SuperCoin Balance</span>
                    <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">₹1 = 1 SuperCoin</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight">🪙 250</span>
                    <span className="text-sm font-semibold text-amber-100">Coins Available</span>
                  </div>
                  <p className="text-xs text-amber-100/90 leading-relaxed">
                    You can use up to <strong>150 Coins (₹150 off)</strong> on your next checkout!
                  </p>
                </div>

                {/* Payment Methods Grid */}
                <div className="space-y-4 pt-4">
                  <h3 className="font-bold text-sm text-neutral-800 uppercase tracking-wider">Saved & Supported Payment Methods</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        COD
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-neutral-800">Cash on Delivery</h4>
                        <p className="text-[11px] text-neutral-500">Available on all orders</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                        UPI
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-neutral-800">Instant UPI</h4>
                        <p className="text-[11px] text-neutral-500">GPay, PhonePe, Paytm</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                        CARD
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-neutral-800">Cards & Net Banking</h4>
                        <p className="text-[11px] text-neutral-500">256-bit SSL encrypted</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 5: COUPONS & OFFERS (AMAZON COUPONS STYLE) */}
            {/* ========================================================= */}
            {activeTab === 'coupons' && (
              <div className="bg-white rounded-3xl shadow-sm border border-neutral-200/80 p-6 md:p-8 space-y-6">
                <div className="pb-6 border-b border-neutral-200">
                  <h2 className="text-2xl font-black text-neutral-dark flex items-center gap-2.5">
                    <Gift className="w-7 h-7 text-[#5C6B4A]" />
                    <span>Exclusive Coupons & Vouchers</span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">Copy and apply these voucher codes at checkout for instant savings.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_COUPONS.map((coupon, idx) => (
                    <div
                      key={idx}
                      className="border-2 border-dashed border-neutral-300 rounded-3xl p-5 hover:border-[#5C6B4A] transition-colors relative bg-gradient-to-br from-white to-neutral-50"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#5C6B4A]/10 text-[#5C6B4A]">
                            {coupon.discount}
                          </span>
                          <h4 className="font-bold text-base text-neutral-900 mt-2">{coupon.title}</h4>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed mb-4">{coupon.description}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-neutral-200/70 text-xs">
                        <span className="text-[11px] text-neutral-400 font-medium">{coupon.expiry}</span>

                        <button
                          onClick={() => handleCopyCoupon(coupon.code)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#5C6B4A] hover:bg-[#48543b] text-white font-bold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          {copiedCoupon === coupon.code ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>COPIED</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>{coupon.code}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 6: 24X7 HELP DESK (AMAZON CUSTOMER SERVICE STYLE) */}
            {/* ========================================================= */}
            {activeTab === 'support' && (
              <div className="bg-white rounded-3xl shadow-sm border border-neutral-200/80 p-6 md:p-8 space-y-6">
                <div className="pb-6 border-b border-neutral-200">
                  <h2 className="text-2xl font-black text-neutral-dark flex items-center gap-2.5">
                    <HelpCircle className="w-7 h-7 text-[#5C6B4A]" />
                    <span>24x7 Customer Support</span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">We are here to assist with tracking, returns, and refunds.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-2">
                    <h4 className="font-bold text-sm text-neutral-900">Email Assistance</h4>
                    <p className="text-xs text-neutral-600">Send an inquiry and our support team will respond within 2 hours.</p>
                    <a
                      href="mailto:reddygowtham397@gmail.com"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C6B4A] hover:underline pt-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>reddygowtham397@gmail.com</span>
                    </a>
                  </div>

                  <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-2">
                    <h4 className="font-bold text-sm text-neutral-900">Instant WhatsApp Support</h4>
                    <p className="text-xs text-neutral-600">Chat with a customer relationship manager for priority help.</p>
                    <a
                      href="https://wa.me/919003125941"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline pt-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Start WhatsApp Chat (+91 90031 25941)</span>
                    </a>
                  </div>
                </div>

                {/* Common FAQs */}
                <div className="space-y-3 pt-4">
                  <h3 className="font-bold text-sm text-neutral-800 uppercase tracking-wider">Frequently Asked Questions</h3>
                  <div className="space-y-2 text-xs">
                    <details className="p-3.5 rounded-xl border border-neutral-200 bg-white cursor-pointer group">
                      <summary className="font-bold text-neutral-800 flex justify-between items-center">
                        <span>How can I track my package?</span>
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-open:rotate-90 transition-transform" />
                      </summary>
                      <p className="text-neutral-600 mt-2 leading-relaxed">
                        Go to the "Your Orders" tab in your profile. Click on any active order to see real-time shipment milestones.
                      </p>
                    </details>

                    <details className="p-3.5 rounded-xl border border-neutral-200 bg-white cursor-pointer group">
                      <summary className="font-bold text-neutral-800 flex justify-between items-center">
                        <span>What is the return policy?</span>
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-open:rotate-90 transition-transform" />
                      </summary>
                      <p className="text-neutral-600 mt-2 leading-relaxed">
                        ShopMate offers a hassle-free 30-day return & exchange guarantee. Courier pickups are 100% free of charge.
                      </p>
                    </details>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
