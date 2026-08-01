import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/useCartStore';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { formatCurrency, convertUsdToInr } from '../utils/formatCurrency';

const Cart = () => {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const subtotalInr = convertUsdToInr(getSubtotal());
  const shippingInr = subtotalInr > 499 || subtotalInr === 0 ? 0 : 50;
  const taxInr = (subtotalInr + shippingInr) * 0.18;
  const totalInr = subtotalInr + shippingInr + taxInr;

  const handleCheckout = () => {
    // Navigate straight to checkout, which is a protected route.
    // The ProtectedRoute component will handle redirecting to login if needed.
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <EmptyState 
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Looks like you haven't added anything to your cart yet. Discover our amazing products!"
        actionLabel="Start Shopping"
        actionLink="/shop"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-neutral-dark mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 p-6 bg-accent-light border-b border-neutral-light text-sm font-semibold text-neutral-dark">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            <div className="divide-y divide-neutral-light">
              {items.map(item => (
                <div key={item.productId} className="p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                  <div className="col-span-6 flex items-center gap-4 w-full">
                    <button 
                      onClick={() => removeItem(item.productId)}
                      className="text-neutral hover:text-red-500 transition-colors p-2 -ml-2"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <Link to={`/product/${item.productId}`} className="w-20 h-20 bg-accent-light rounded-lg overflow-hidden flex-shrink-0 border border-neutral-light">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <Link to={`/product/${item.productId}`} className="font-semibold text-neutral-dark hover:text-primary transition-colors line-clamp-2">
                      {item.name}
                    </Link>
                  </div>
                  
                  <div className="col-span-2 text-center w-full sm:w-auto font-medium text-neutral-dark flex justify-between sm:block">
                    <span className="sm:hidden text-neutral font-normal">Price:</span>
                    {formatCurrency(convertUsdToInr(item.price))}
                  </div>
                  
                    <div className="col-span-2 flex justify-center w-full sm:w-auto">
                      <div className="flex items-center border border-neutral-light rounded-full overflow-hidden bg-white shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className={`w-8 h-8 flex items-center justify-center transition-colors ${item.quantity === 1 ? 'text-red-500 hover:bg-red-50' : 'text-neutral hover:bg-neutral-light'}`}
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3 h-3" />}
                        </button>
                        <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-neutral hover:bg-neutral-light transition-colors"
                        >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-right w-full sm:w-auto font-bold text-neutral-dark flex justify-between sm:block">
                    <span className="sm:hidden text-neutral font-normal">Subtotal:</span>
                    {formatCurrency(convertUsdToInr(item.price * item.quantity))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 sticky top-24">
            <h2 className="text-xl font-bold text-neutral-dark mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-neutral">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotalInr)}</span>
              </div>
              <div className="flex justify-between text-neutral">
                <span>Shipping</span>
                <span className="font-medium">{shippingInr === 0 ? 'Free' : formatCurrency(shippingInr)}</span>
              </div>
              {shippingInr > 0 && (
                <p className="text-xs text-neutral">Free shipping on orders over ₹499</p>
              )}
              <div className="flex justify-between text-neutral">
                <span>GST (18%)</span>
                <span className="font-medium">{formatCurrency(taxInr)}</span>
              </div>
              <div className="pt-4 border-t border-neutral-light flex justify-between items-center text-lg font-bold text-neutral-dark">
                <span>Total</span>
                <span>{formatCurrency(totalInr)}</span>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-8"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
            
            {!currentUser && (
              <p className="text-center text-xs text-neutral mt-4">
                You will be asked to log in or create an account at checkout.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
