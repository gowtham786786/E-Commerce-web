import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribed(true);
    toast.success('Thank you for subscribing! Check your inbox for exclusive offers.');
    setEmail('');
  };

  return (
    <footer className="bg-[#FAF8F5] pt-16 pb-8 border-t border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Blurb */}
          <div className="space-y-4 col-span-1">
            <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
              <ShoppingBag className="w-6 h-6" />
              <span>ShopMate</span>
            </Link>
            <p className="text-neutral text-sm leading-relaxed max-w-xs">
              Your one-stop shop for quality products at the best prices. Experience seamless shopping and premium customer service with every order.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-neutral-600">
              <ShieldCheck className="w-4 h-4 text-[#5C6B4A]" />
              <span>Verified 100% Genuine Products</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-neutral-dark mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-neutral">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-primary transition-colors">Shop All Products</Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-primary transition-colors font-medium">Categories</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-neutral-dark mb-4">Customer Service</h3>
            <ul className="space-y-2.5 text-sm text-neutral">
              <li>
                <Link to="/track-order" className="hover:text-primary transition-colors font-medium flex items-center gap-1.5">
                  <span>Track Order</span>
                </Link>
              </li>
              <li>
                <Link to="/returns-refunds" className="hover:text-primary transition-colors">Returns & Refunds</Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors font-medium">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-neutral-dark mb-4">Subscribe to our newsletter</h3>
            <p className="text-sm text-neutral mb-4 leading-relaxed">
              Get the latest updates on new products and upcoming sales directly to your inbox.
            </p>
            {subscribed ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>You're subscribed to ShopMate updates!</span>
              </div>
            ) : (
              <form className="flex" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  required
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-l-xl border border-neutral-300 focus:outline-none focus:border-primary text-sm bg-white"
                />
                <button 
                  type="submit" 
                  className="bg-primary text-white px-5 py-2.5 rounded-r-xl hover:bg-primary-dark transition-colors text-sm font-bold whitespace-nowrap shadow-xs"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

        </div>
        
        <div className="border-t border-neutral-200/80 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-neutral">
          <p>&copy; {new Date().getFullYear()} ShopMate. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6 mt-4 md:mt-0 text-xs font-medium">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/admin" className="hover:text-primary font-bold ml-2 px-3 py-1 bg-neutral-200/60 rounded-lg">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
