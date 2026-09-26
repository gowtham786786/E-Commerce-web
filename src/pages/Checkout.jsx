import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useCartStore from '../store/useCartStore';
import { formatCurrency, convertUsdToInr } from '../utils/formatCurrency';
import { supabase } from '../supabase/supabase';
import { 
  CheckCircle2, 
  ChevronRight, 
  CreditCard, 
  Banknote, 
  ArrowLeft, 
  MapPin, 
  Plus, 
  Phone, 
  Truck, 
  Building2, 
  Home, 
  ShieldCheck, 
  Check, 
  Edit3,
  QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import useStoreSettings from '../hooks/useStoreSettings';

const STEPS = [
  { name: 'Delivery Address', short: 'Address' },
  { name: 'Review Order', short: 'Review' },
  { name: 'Payment Options', short: 'Payment' }
];

const Checkout = () => {
  const { currentUser } = useAuth();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { taxRate, calculateTax, calculateShipping, getEffectiveTaxRate } = useStoreSettings();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Address Book State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // Active Shipping Form State
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    pincode: '',
    street: '',
    area: '',
    city: '',
    state: '',
    country: 'India',
    type: 'Home',
    isDefault: false,
    saveAddress: true,
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod', 'upi', 'card'

  // Pre-fill addresses from Profile / localStorage or currentUser
  useEffect(() => {
    if (currentUser) {
      const uid = currentUser.id || currentUser.uid;
      const storageKey = `shopmate_addresses_${uid}`;
      const localAddresses = localStorage.getItem(storageKey);
      let parsed = [];

      if (localAddresses) {
        try {
          parsed = JSON.parse(localAddresses);
        } catch {
          parsed = [];
        }
      } else if (currentUser.addresses && currentUser.addresses.length > 0) {
        parsed = currentUser.addresses;
      }

      const defaultName = currentUser.displayName || currentUser.name || '';
      const defaultPhone = currentUser.phone || '';

      if (parsed && parsed.length > 0) {
        setSavedAddresses(parsed);
        const defIdx = parsed.findIndex((a) => a.isDefault);
        const initialIdx = defIdx !== -1 ? defIdx : 0;
        setSelectedAddressIndex(initialIdx);
        setAddress({
          ...parsed[initialIdx],
          name: parsed[initialIdx].name || defaultName,
          phone: parsed[initialIdx].phone || defaultPhone,
          country: parsed[initialIdx].country || 'India',
          saveAddress: false,
        });
        setIsAddingNewAddress(false);
      } else {
        // No saved addresses yet - initialize empty new address with prefilled name & phone
        setIsAddingNewAddress(true);
        setAddress((prev) => ({
          ...prev,
          name: defaultName,
          phone: defaultPhone,
          country: 'India',
          type: 'Home',
          saveAddress: true,
        }));
      }
    }
  }, [currentUser]);

  // Calculations (Dynamic from Admin Store Settings)
  const subtotalInr = convertUsdToInr(getSubtotal());
  const shippingCostInr = calculateShipping(subtotalInr);
  const taxInr = calculateTax(subtotalInr, items);
  const totalInr = subtotalInr + shippingCostInr + taxInr;
  const currentTaxRate = getEffectiveTaxRate(items, subtotalInr);

  // Protect empty cart
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  // Helper to save address to user's address book in localStorage
  const persistAddressToStorage = (newAddr) => {
    const uid = currentUser?.id || currentUser?.uid;
    if (!uid) return;
    const storageKey = `shopmate_addresses_${uid}`;
    let currentList = [];
    try {
      const existing = localStorage.getItem(storageKey);
      if (existing) currentList = JSON.parse(existing);
    } catch {
      currentList = [];
    }

    // Check if duplicate already exists by street & pincode
    const exists = currentList.some(
      (a) => a.street === newAddr.street && (a.pincode === newAddr.pincode || a.zip === newAddr.zip)
    );

    if (!exists) {
      const updatedList = [
        ...currentList.map((a) => (newAddr.isDefault ? { ...a, isDefault: false } : a)),
        {
          name: newAddr.name,
          phone: newAddr.phone,
          pincode: newAddr.pincode || newAddr.zip,
          street: newAddr.street,
          area: newAddr.area || '',
          city: newAddr.city,
          state: newAddr.state,
          country: newAddr.country || 'India',
          type: newAddr.type || 'Home',
          isDefault: currentList.length === 0 ? true : !!newAddr.isDefault,
        }
      ];
      localStorage.setItem(storageKey, JSON.stringify(updatedList));
      setSavedAddresses(updatedList);
    }
  };

  const handleSelectSavedAddress = (index) => {
    setSelectedAddressIndex(index);
    const chosen = savedAddresses[index];
    setAddress({
      ...chosen,
      name: chosen.name || currentUser?.displayName || '',
      phone: chosen.phone || currentUser?.phone || '',
      country: chosen.country || 'India',
      saveAddress: false,
    });
  };

  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    setError('');

    if (currentStep === 0) {
      // Validate full shipping details
      if (!address.name?.trim()) {
        setError('Please enter the recipient Full Name');
        return;
      }
      if (!address.phone?.trim() || address.phone.replace(/\D/g, '').length < 10) {
        setError('Please enter a valid 10-digit mobile phone number');
        return;
      }
      if (!address.pincode?.trim() && !address.zip?.trim()) {
        setError('Please enter a 6-digit postal PIN code');
        return;
      }
      if (!address.street?.trim()) {
        setError('Please enter your flat, house number, building, or street address');
        return;
      }
      if (!address.city?.trim()) {
        setError('Please enter your city / town / district');
        return;
      }
      if (!address.state?.trim()) {
        setError('Please enter your state / province');
        return;
      }

      // If user chose to save this address or this is their first address
      if (address.saveAddress || savedAddresses.length === 0) {
        persistAddressToStorage(address);
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const sub = subtotalInr;
      const ship = shippingCostInr;
      const tax = taxInr;
      const tot = totalInr;

      const fullStreet = address.area
        ? `${address.street}, ${address.area}`
        : address.street;

      const customerEmail = currentUser?.email || address.email || '';
      const customerName = address.name || currentUser?.displayName || currentUser?.name || 'Valued Customer';
      const customerPhone = address.phone || currentUser?.phone || '';

      const finalAddress = {
        full_name: customerName,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        street: fullStreet,
        area: address.area || '',
        city: address.city,
        state: address.state,
        zip: address.pincode || address.zip || '',
        pincode: address.pincode || address.zip || '',
        country: address.country || 'India',
        type: address.type || 'Home',
      };

      const orderData = {
        user_id: currentUser?.id || currentUser?.uid || null,
        items,
        shipping_address: finalAddress,
        payment_method: paymentMethod,
        subtotal: sub,
        shipping: ship,
        tax: tax,
        total: tot,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      const { data: newOrder, error: orderErr } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderErr) throw orderErr;

      // Save to localStorage addresses if saveAddress is checked
      if (address.saveAddress) {
        persistAddressToStorage(address);
      }

      // Clear Cart (Zustand)
      clearCart();

      // Navigate to confirmation
      toast.success('Order placed successfully! 🎉');
      navigate('/order-confirmation', { state: { orderId: newOrder?.id } });
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Failed to place order. Please try again.');
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#FBF9F5] pb-16">
      {/* ========================================================= */}
      {/* MODERN AMAZON / FLIPKART STYLE STEPPER HEADER */}
      {/* ========================================================= */}
      <div className="bg-white border-b border-neutral-200/80 shadow-xs pt-6 pb-6 px-4 mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between relative">
            {/* Background connecting line */}
            <div className="absolute top-5 left-8 right-8 h-1 bg-neutral-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-5 left-8 h-1 bg-[#5C6B4A] -translate-y-1/2 transition-all duration-300 z-0"
              style={{
                width: currentStep === 0 ? '0%' : currentStep === 1 ? '50%' : '100%',
              }}
            />

            {STEPS.map((step, index) => {
              const isCompleted = currentStep > index;
              const isCurrent = currentStep === index;
              return (
                <div key={step.name} className="flex flex-col items-center relative z-10 bg-white px-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (index < currentStep) setCurrentStep(index);
                    }}
                    disabled={index > currentStep}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700'
                        : isCurrent
                        ? 'bg-[#5C6B4A] text-white ring-4 ring-[#5C6B4A]/20'
                        : 'bg-white border-2 border-neutral-300 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : index + 1}
                  </button>
                  <span
                    className={`mt-2 text-xs sm:text-sm font-bold tracking-tight text-center ${
                      isCurrent
                        ? 'text-neutral-900 font-extrabold'
                        : isCompleted
                        ? 'text-emerald-700'
                        : 'text-neutral-400'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="max-w-5xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <span>⚠️ {error}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto items-start">
          {/* Main Checkout Flow Area */}
          <div className="w-full lg:w-2/3 space-y-6">
            
            {/* ========================================================= */}
            {/* STEP 1: DELIVERY ADDRESS */}
            {/* ========================================================= */}
            {currentStep === 0 && (
              <div className="bg-white rounded-3xl shadow-xs border border-neutral-200/80 p-6 sm:p-8">
                
                {/* Header with Title and Mode Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-neutral-dark flex items-center gap-2.5">
                      <MapPin className="w-6 h-6 text-[#5C6B4A]" />
                      <span>Delivery Address</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                      {isAddingNewAddress
                        ? 'Please enter accurate delivery details for courier dispatch.'
                        : 'Select where you would like your order delivered.'}
                    </p>
                  </div>

                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isAddingNewAddress) {
                          setIsAddingNewAddress(false);
                          if (savedAddresses[selectedAddressIndex]) {
                            setAddress(savedAddresses[selectedAddressIndex]);
                          }
                        } else {
                          setIsAddingNewAddress(true);
                          setAddress({
                            name: currentUser?.displayName || currentUser?.name || '',
                            phone: currentUser?.phone || '',
                            pincode: '',
                            street: '',
                            area: '',
                            city: '',
                            state: '',
                            country: 'India',
                            type: 'Home',
                            isDefault: false,
                            saveAddress: true,
                          });
                        }
                      }}
                      className="px-4 py-2 bg-[#5C6B4A]/10 text-[#5C6B4A] hover:bg-[#5C6B4A] hover:text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5"
                    >
                      {isAddingNewAddress ? (
                        <>
                          <ArrowLeft className="w-4 h-4" />
                          <span>Use Saved Address</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>+ Add New Address</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* OPTION A: SAVED ADDRESSES SELECTOR (AMAZON / FLIPKART STYLE) */}
                {savedAddresses.length > 0 && !isAddingNewAddress ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {savedAddresses.map((addr, idx) => {
                        const isSelected = selectedAddressIndex === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => handleSelectSavedAddress(idx)}
                            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                              isSelected
                                ? 'border-[#5C6B4A] bg-[#5C6B4A]/5 shadow-sm'
                                : 'border-neutral-200 bg-white hover:border-[#5C6B4A]/40'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Radio selector */}
                              <div className="pt-0.5">
                                <input
                                  type="radio"
                                  name="saved_address_radio"
                                  checked={isSelected}
                                  onChange={() => handleSelectSavedAddress(idx)}
                                  className="w-4 h-4 accent-[#5C6B4A] cursor-pointer"
                                />
                              </div>

                              <div className="flex-1">
                                {/* Name and Tags */}
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  <span className="font-extrabold text-neutral-900 text-base">
                                    {addr.name || currentUser?.displayName || 'Primary Recipient'}
                                  </span>
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#5C6B4A]/15 text-[#5C6B4A]">
                                    {addr.type || 'Home'}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-700">
                                      Default
                                    </span>
                                  )}
                                </div>

                                {/* Formatted Address */}
                                <p className="text-sm text-neutral-700 font-medium leading-relaxed">
                                  {addr.street}
                                  {addr.area ? `, ${addr.area}` : ''}
                                  <br />
                                  {addr.city}, {addr.state} -{' '}
                                  <span className="font-bold text-neutral-900">
                                    {addr.pincode || addr.zip}
                                  </span>
                                </p>

                                {/* Contact Phone */}
                                <p className="text-xs text-neutral-600 mt-2 font-medium flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-[#5C6B4A]" />
                                  <span>
                                    Mobile:{' '}
                                    <strong className="text-neutral-900">
                                      {addr.phone || currentUser?.phone || 'Not provided'}
                                    </strong>
                                  </span>
                                </p>

                                {/* Deliver to this address CTA when selected */}
                                {isSelected && (
                                  <div className="mt-4 pt-3 border-t border-[#5C6B4A]/20 flex flex-wrap items-center justify-between gap-3">
                                    <button
                                      type="button"
                                      onClick={handleNextStep}
                                      className="px-6 py-2.5 bg-[#5C6B4A] hover:bg-[#48543a] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
                                    >
                                      <span>Deliver to this Address</span>
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Selected for Delivery
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Add Address Button */}
                    <div
                      onClick={() => {
                        setIsAddingNewAddress(true);
                        setAddress({
                          name: currentUser?.displayName || currentUser?.name || '',
                          phone: currentUser?.phone || '',
                          pincode: '',
                          street: '',
                          area: '',
                          city: '',
                          state: '',
                          country: 'India',
                          type: 'Home',
                          isDefault: false,
                          saveAddress: true,
                        });
                      }}
                      className="border-2 border-dashed border-neutral-300 rounded-2xl p-4 text-center hover:border-[#5C6B4A] hover:bg-[#5C6B4A]/5 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm font-bold text-neutral-700"
                    >
                      <Plus className="w-4 h-4 text-[#5C6B4A]" />
                      <span>+ Add Another Delivery Address</span>
                    </div>
                  </div>
                ) : (
                  /* OPTION B: COMPREHENSIVE SHIPPING ADDRESS FORM */
                  <form onSubmit={handleNextStep} className="space-y-5">
                    {/* Section 1: Contact Details */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                        1. Contact Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                            Full Name (Recipient) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Gowtham Reddy"
                            value={address.name}
                            onChange={(e) => setAddress({ ...address, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-800 focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A] bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                            10-Digit Mobile Number *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500">
                              +91
                            </span>
                            <input
                              type="tel"
                              required
                              maxLength={13}
                              placeholder="9876543210"
                              value={address.phone.startsWith('+91') ? address.phone.slice(3) : address.phone}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setAddress({ ...address, phone: val });
                              }}
                              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-800 focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A] bg-white"
                            />
                          </div>
                          <span className="text-[11px] text-neutral-500 mt-1 block">
                            Required for delivery updates and courier OTP verification.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Address Information */}
                    <div className="pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                        2. Address Information
                      </h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                              6-Digit PIN Code *
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              placeholder="500001"
                              value={address.pincode || address.zip || ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setAddress({ ...address, pincode: val, zip: val });
                              }}
                              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-800 focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A] bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                              City / Town / District *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Hyderabad"
                              value={address.city}
                              onChange={(e) => setAddress({ ...address, city: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-800 focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A] bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                              State / Province *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Telangana"
                              value={address.state}
                              onChange={(e) => setAddress({ ...address, state: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-800 focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A] bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                            Flat, House No., Building, Apartment *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Flat 302, Sri Krishna Residency, Road No. 4"
                            value={address.street}
                            onChange={(e) => setAddress({ ...address, street: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-800 focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A] bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                              Area, Colony, Street, Landmark (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Near HDFC Bank, Jubilee Hills"
                              value={address.area || ''}
                              onChange={(e) => setAddress({ ...address, area: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-800 focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A] bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                              Country
                            </label>
                            <input
                              type="text"
                              value={address.country || 'India'}
                              readOnly
                              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-600 bg-neutral-100 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Address Type & Preferences */}
                    <div className="pt-2 border-t border-neutral-200">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-2">
                            Address Type
                          </label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
                              <input
                                type="radio"
                                name="addressType"
                                checked={address.type === 'Home'}
                                onChange={() => setAddress({ ...address, type: 'Home' })}
                                className="accent-[#5C6B4A]"
                              />
                              <span className="flex items-center gap-1">
                                <Home className="w-3.5 h-3.5 text-[#5C6B4A]" /> Home (All-day delivery)
                              </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
                              <input
                                type="radio"
                                name="addressType"
                                checked={address.type === 'Work'}
                                onChange={() => setAddress({ ...address, type: 'Work' })}
                                className="accent-[#5C6B4A]"
                              />
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-[#5C6B4A]" /> Work (10 AM - 5 PM)
                              </span>
                            </label>
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer pt-2 sm:pt-0">
                          <input
                            type="checkbox"
                            checked={address.saveAddress}
                            onChange={(e) => setAddress({ ...address, saveAddress: e.target.checked })}
                            className="w-4 h-4 rounded text-[#5C6B4A] accent-[#5C6B4A] focus:ring-[#5C6B4A]"
                          />
                          <span className="text-xs font-semibold text-neutral-700">
                            Save this address to my Address Book
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-neutral-200 flex justify-end">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-8 py-3 bg-[#5C6B4A] hover:bg-[#48543a] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <span>Save & Deliver to this Address</span>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 2: REVIEW YOUR ORDER */}
            {/* ========================================================= */}
            {currentStep === 1 && (
              <div className="bg-white rounded-3xl shadow-xs border border-neutral-200/80 p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-dark">
                    Review Your Order
                  </h2>
                  <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-lg">
                    {items.length} {items.length === 1 ? 'Item' : 'Items'} in Cart
                  </span>
                </div>

                {/* Delivery Address Summary Card */}
                <div className="bg-[#5C6B4A]/5 border border-[#5C6B4A]/30 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#5C6B4A] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#5C6B4A] uppercase tracking-wider">
                            Delivering to:
                          </span>
                          <span className="font-extrabold text-neutral-900 text-sm">
                            {address.name || currentUser?.displayName}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#5C6B4A] text-white">
                            {address.type || 'Home'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-700 font-medium">
                          {address.street}
                          {address.area ? `, ${address.area}` : ''}, {address.city}, {address.state} -{' '}
                          <span className="font-bold text-neutral-900">
                            {address.pincode || address.zip}
                          </span>
                        </p>
                        <p className="text-xs text-neutral-500 mt-1 font-semibold flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#5C6B4A]" /> Mobile:{' '}
                          <span className="text-neutral-900">
                            {address.phone || currentUser?.phone}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(0)}
                      className="text-xs font-bold text-[#5C6B4A] hover:bg-[#5C6B4A] hover:text-white px-3 py-1.5 rounded-xl border border-[#5C6B4A]/40 transition-all flex items-center gap-1 shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Change</span>
                    </button>
                  </div>
                </div>

                {/* Delivery Guarantee Banner */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-center gap-3">
                  <Truck className="w-6 h-6 text-amber-600 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-neutral-900 block">
                      ⚡ ShopMate Standard Express Delivery
                    </span>
                    <span className="text-neutral-600">
                      Guaranteed arrival in 3-5 business days with live parcel tracking.
                    </span>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Order Items
                  </h3>
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4 p-4 border border-neutral-200 rounded-2xl bg-white hover:border-[#5C6B4A]/30 transition-colors"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-neutral-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-neutral-900 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-neutral-500 mt-0.5">Quantity: {item.quantity}</p>
                        <p className="text-xs text-neutral-600 mt-1">
                          Unit Price: {formatCurrency(convertUsdToInr(item.price))}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-neutral-900 text-sm sm:text-base">
                          {formatCurrency(convertUsdToInr(item.price * item.quantity))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Step 2 Actions */}
                <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="text-neutral-600 font-bold hover:text-neutral-900 transition-colors flex items-center gap-1.5 text-xs sm:text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Address
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full sm:w-auto px-8 py-3 bg-[#5C6B4A] hover:bg-[#48543a] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Continue to Payment</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 3: PAYMENT METHOD */}
            {/* ========================================================= */}
            {currentStep === 2 && (
              <div className="bg-white rounded-3xl shadow-xs border border-neutral-200/80 p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-dark">
                    Select Payment Method
                  </h2>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-emerald-200">
                    <ShieldCheck className="w-4 h-4" /> 100% Safe & Secure
                  </span>
                </div>

                {/* Delivery Target Strip */}
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500 font-bold block uppercase tracking-wider text-[10px]">
                      Delivering to:
                    </span>
                    <span className="font-extrabold text-neutral-900">
                      {address.name} ({address.city} - {address.pincode || address.zip})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(0)}
                    className="text-[#5C6B4A] font-bold hover:underline"
                  >
                    Change
                  </button>
                </div>

                {/* Payment Options */}
                <div className="space-y-4">
                  {/* 1. Cash on Delivery */}
                  <label
                    className={`block border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#5C6B4A] bg-[#5C6B4A]/5 shadow-sm'
                        : 'border-neutral-200 hover:border-[#5C6B4A]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="w-5 h-5 accent-[#5C6B4A]"
                        />
                        <div>
                          <span className="font-extrabold text-neutral-900 text-sm sm:text-base block">
                            Cash on Delivery (COD)
                          </span>
                          <span className="text-xs text-neutral-500">
                            Pay with cash or UPI QR code at your doorstep upon arrival.
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Banknote className="w-6 h-6" />
                      </div>
                    </div>
                  </label>

                  {/* 2. UPI / Online Banking */}
                  <label
                    className={`block border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-[#5C6B4A] bg-[#5C6B4A]/5 shadow-sm'
                        : 'border-neutral-200 hover:border-[#5C6B4A]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                          className="w-5 h-5 accent-[#5C6B4A]"
                        />
                        <div>
                          <span className="font-extrabold text-neutral-900 text-sm sm:text-base block">
                            UPI (Google Pay, PhonePe, Paytm)
                          </span>
                          <span className="text-xs text-neutral-500">
                            Instant zero-fee payment via any UPI application.
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                        <QrCode className="w-6 h-6" />
                      </div>
                    </div>
                  </label>

                  {/* 3. Credit / Debit Card (Demo) */}
                  <label
                    className={`block border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#5C6B4A] bg-[#5C6B4A]/5 shadow-sm'
                        : 'border-neutral-200 hover:border-[#5C6B4A]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="w-5 h-5 accent-[#5C6B4A]"
                        />
                        <div>
                          <span className="font-extrabold text-neutral-900 text-sm sm:text-base block">
                            Credit / Debit / ATM Card
                          </span>
                          <span className="text-xs text-neutral-500">
                            Visa, MasterCard, RuPay, Maestro accepted.
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                        <CreditCard className="w-6 h-6" />
                      </div>
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="mt-4 pt-4 border-t border-neutral-200 space-y-3">
                        <input
                          type="text"
                          placeholder="Card Number (Demo: 4532 •••• •••• 8921)"
                          className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm font-semibold bg-white"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="MM / YY"
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm font-semibold bg-white"
                          />
                          <input
                            type="text"
                            placeholder="CVV"
                            maxLength={4}
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl text-sm font-semibold bg-white"
                          />
                        </div>
                        <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                          🛡️ Demo environment enabled. Do not enter real banking card details.
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Final Order Placement CTA */}
                <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="text-neutral-600 font-bold hover:text-neutral-900 transition-colors flex items-center gap-1.5 text-xs sm:text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Review
                  </button>

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full sm:w-auto px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Confirming Order...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Place Order • {formatCurrency(totalInr)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SIDEBAR ORDER SUMMARY (STICKY) */}
          {/* ========================================================= */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-xs border border-neutral-200/80 p-6 sticky top-24 space-y-6">
              <h3 className="text-lg font-black text-neutral-dark pb-4 border-b border-neutral-200">
                Price Details ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h3>

              <div className="space-y-3.5 text-sm text-neutral-600 border-b border-neutral-200 pb-5">
                <div className="flex justify-between items-center">
                  <span>Price (items subtotal)</span>
                  <span className="font-semibold text-neutral-900">{formatCurrency(subtotalInr)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Charges</span>
                  <span className={`font-semibold ${shippingCostInr === 0 ? 'text-emerald-600 font-bold' : 'text-neutral-900'}`}>
                    {shippingCostInr === 0 ? 'FREE Delivery' : formatCurrency(shippingCostInr)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Applicable GST ({currentTaxRate}%)</span>
                  <span className="font-semibold text-neutral-900">{formatCurrency(taxInr)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-lg font-black text-neutral-dark">
                <span>Total Payable</span>
                <span className="text-[#5C6B4A] text-xl font-extrabold">{formatCurrency(totalInr)}</span>
              </div>

              {shippingCostInr === 0 && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Congratulations! You qualify for Free Delivery.</span>
                </div>
              )}

              <div className="pt-2 text-[11px] text-neutral-400 space-y-2 border-t border-neutral-100">
                <p className="flex items-center gap-1.5 font-medium text-neutral-500">
                  <ShieldCheck className="w-4 h-4 text-[#5C6B4A]" /> Safe and Secure Payments. Easy returns.
                </p>
                <p>100% Authentic products directly from verified suppliers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
