import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-accent-light pt-16 pb-8 border-t border-accent-dark/30">
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
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-neutral-dark mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-neutral">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-primary transition-colors">Shop</Link></li>
              <li><Link to="/shop" className="hover:text-primary transition-colors">Categories</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-neutral-dark mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm text-neutral">
              <li><Link to="/" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-neutral-dark mb-4">Subscribe to our newsletter</h3>
            <p className="text-sm text-neutral mb-4 leading-relaxed">
              Get the latest updates on new products and upcoming sales directly to your inbox.
            </p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-4 py-2 rounded-l-lg border border-neutral-light focus:outline-none focus:border-primary text-sm"
                required
              />
              <button 
                type="submit" 
                className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary-dark transition-colors text-sm font-medium whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>
        
        <div className="border-t border-accent-dark/30 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-neutral">
          <p>&copy; {new Date().getFullYear()} ShopMate. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/" className="hover:text-primary">Terms of Service</Link>
            <Link to="/admin" className="hover:text-primary font-medium ml-4">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
