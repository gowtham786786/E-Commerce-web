import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useCartStore from '../store/useCartStore';
import { formatCurrency, convertUsdToInr } from '../utils/formatCurrency';
import { db } from '../firebase/firebase';
import { doc, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { CheckCircle2, ChevronRight, CreditCard, Banknote, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Review', 'Payment'];

const Checkout = () => {
  const { currentUser } = useAuth();
  const { items, getSubtotal, clearCart } = useCartStore();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Shipping State
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'card'

  // Pre-fill address if available
  useEffect(() => {
    if (currentUser?.addresses && currentUser.addresses.length > 0) {
      setAddress(currentUser.addresses[0]);
    }
  }, [currentUser]);

  // Calculations
  const subtotalInr = convertUsdToInr(getSubtotal());
  const taxInr = subtotalInr * 0.18;
  const shippingCostInr = subtotalInr > 499 || subtotalInr === 0 ? 0 : 50;
  const totalInr = subtotalInr + shippingCostInr + taxInr;

  // Protect empty cart
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');

    if (currentStep === 0) {
      // Validate address
      if (!address.street || !address.city || !address.state || !address.zip || !address.country) {
        setError('Please fill in all shipping fields');
        return;
      }
    }
    
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo(0, 0);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Create order doc
      const orderData = {
        userId: currentUser.uid,
        items,
        shippingAddress: address,
        paymentMethod,
        subtotal: getSubtotal(),
        shipping: getSubtotal() > (499 / 93) || getSubtotal() === 0 ? 0 : (50 / 93),
        tax: getSubtotal() * 0.18,
        total: getSubtotal() + (getSubtotal() > (499 / 93) || getSubtotal() === 0 ? 0 : (50 / 93)) + (getSubtotal() * 0.18),
        status: 'pending',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      // 2. Clear Cart (Zustand)
      clearCart();

      // 3. Navigate to confirmation
      toast.success('Order placed successfully!');
      navigate('/order-confirmation', { state: { orderId: docRef.id } });

    } catch (err) {
      console.error("Checkout error:", err);
      toast.error('Failed to place order. Please try again.');
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Checkout Steps Header */}
      <div className="mb-10">
        <div className="flex items-center justify-center max-w-3xl mx-auto">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  currentStep > index ? 'bg-green-500 text-white' :
                  currentStep === index ? 'bg-primary text-white' :
                  'bg-neutral-light text-neutral'
                }`}>
                  {currentStep > index ? <CheckCircle2 className="w-6 h-6" /> : index + 1}
                </div>
                <span className={`mt-2 text-sm font-medium ${currentStep >= index ? 'text-neutral-dark' : 'text-neutral'}`}>
                  {step}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-16 sm:w-24 h-1 mx-2 sm:mx-4 ${currentStep > index ? 'bg-green-500' : 'bg-neutral-light'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto mb-6 bg-red-50 text-red-500 p-4 rounded-lg font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
        {/* Main Content Area */}
        <div className="w-full lg:w-2/3">
          
          {/* Step 1: Shipping */}
          {currentStep === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-neutral-dark mb-6">Shipping Information</h2>
              <form onSubmit={handleNextStep} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({...address, street: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">State / Province</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({...address, state: e.target.value})}
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">ZIP / Postal Code</label>
                    <input
                      type="text"
                      value={address.zip}
                      onChange={(e) => setAddress({...address, zip: e.target.value})}
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Country</label>
                    <input
                      type="text"
                      value={address.country}
                      onChange={(e) => setAddress({...address, country: e.target.value})}
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="pt-6 flex justify-end">
                  <button type="submit" className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors flex items-center gap-2">
                    Continue to Review <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Review */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-neutral-dark mb-6">Review Your Order</h2>
              
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 p-4 border border-neutral-light rounded-xl">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg border border-neutral-light" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-dark">{item.name}</h4>
                      <p className="text-sm text-neutral mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-neutral-dark">
                        {formatCurrency(convertUsdToInr(item.price * item.quantity))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-accent-light p-4 rounded-xl mb-8">
                <h4 className="font-semibold text-neutral-dark mb-2">Shipping To:</h4>
                <p className="text-sm text-neutral">
                  {address.street}<br/>
                  {address.city}, {address.state} {address.zip}<br/>
                  {address.country}
                </p>
              </div>

              <div className="pt-2 flex justify-between">
                <button onClick={handlePrevStep} className="text-neutral font-medium hover:text-neutral-dark transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back to Shipping
                </button>
                <button onClick={handleNextStep} className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors flex items-center gap-2">
                  Continue to Payment <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-neutral-dark mb-6">Payment Method</h2>
              
              <div className="space-y-4 mb-8">
                <label className={`block border rounded-xl p-4 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-neutral-light hover:border-primary/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="w-5 h-5 accent-primary"
                      />
                      <span className="font-medium text-neutral-dark">Cash on Delivery</span>
                    </div>
                    <Banknote className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-primary' : 'text-neutral'}`} />
                  </div>
                  <p className="text-sm text-neutral mt-2 ml-8">Pay with cash when your order arrives.</p>
                </label>

                <label className={`block border rounded-xl p-4 cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-neutral-light hover:border-primary/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="w-5 h-5 accent-primary"
                      />
                      <span className="font-medium text-neutral-dark">Credit/Debit Card (Demo)</span>
                    </div>
                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-primary' : 'text-neutral'}`} />
                  </div>
                  
                  {paymentMethod === 'card' && (
                    <div className="mt-4 ml-8 space-y-3">
                      <input type="text" placeholder="Card Number (Demo)" className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:border-primary text-sm bg-white" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="MM/YY" className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:border-primary text-sm bg-white" />
                        <input type="text" placeholder="CVC" className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:border-primary text-sm bg-white" />
                      </div>
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        *This is a mock checkout. Do not enter real card details.
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button onClick={handlePrevStep} className="text-neutral font-medium hover:text-neutral-dark transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back to Review
                </button>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-70 shadow-md hover:shadow-lg"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 sticky top-24">
            <h2 className="text-xl font-bold text-neutral-dark mb-6">Order Summary</h2>
            
            <div className="space-y-3 mb-6 border-b border-neutral-light pb-6">
              <div className="flex justify-between text-neutral">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotalInr)}</span>
              </div>
              <div className="flex justify-between text-neutral">
                <span>Shipping</span>
                <span className="font-medium">{shippingCostInr === 0 ? 'Free' : formatCurrency(shippingCostInr)}</span>
              </div>
              <div className="flex justify-between text-neutral">
                <span>GST (18%)</span>
                <span className="font-medium">{formatCurrency(taxInr)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-lg font-bold text-neutral-dark mb-8">
              <span>Total</span>
              <span>{formatCurrency(totalInr)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
