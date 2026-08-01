import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, HeadphonesIcon, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';

const CATEGORIES = [
  { name: 'Electronics', color: 'bg-blue-100', img: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&w=150&q=80' },
  { name: 'Fashion', color: 'bg-pink-100', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80' },
  { name: 'Home & Kitchen', color: 'bg-orange-100', img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=150&q=80' },
  { name: 'Beauty', color: 'bg-purple-100', img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=150&q=80' },
  { name: 'Sports', color: 'bg-teal-100', img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=150&q=80' },
  { name: 'Accessories', color: 'bg-rose-100', img: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=150&q=80' },
];

const TESTIMONIALS = [
  { id: 1, text: "Amazing products and fast delivery! ShopMate is my go-to store for all my needs.", name: "John D.", rating: 5, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" },
  { id: 2, text: "Great quality at affordable prices. The customer support is also very responsive.", name: "Sarah M.", rating: 5, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" },
  { id: 3, text: "Very happy with my purchase. Highly recommend ShopMate to everyone!", name: "Michael T.", rating: 5, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" },
];

const Home = () => {
  const { products, loading, error, refetch } = useProducts();

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="bg-accent pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 space-y-6">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              • New Arrivals
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-dark leading-tight">
              Discover The Best Products for You
            </h1>
            <p className="text-neutral text-lg max-w-lg">
              Explore our wide range of high-quality products at affordable prices. Shop now and enjoy the best deals!
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/shop" className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-soft">
                Shop Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/shop?sale=true" className="bg-white hover:bg-neutral-light text-neutral-dark px-6 py-3 rounded-xl font-medium transition-colors border border-neutral-200">
                Explore Deals
              </Link>
            </div>
            {/* Avatars */}
            <div className="flex items-center gap-4 pt-6">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-accent object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Customer" />
                <img className="w-10 h-10 rounded-full border-2 border-accent object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="Customer" />
                <img className="w-10 h-10 rounded-full border-2 border-accent object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Customer" />
                <img className="w-10 h-10 rounded-full border-2 border-accent object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Customer" />
              </div>
              <p className="text-sm text-neutral font-medium">
                Trusted by 10,000+ Happy Customers
              </p>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-primary/5 rounded-full filter blur-3xl transform scale-90"></div>
            <div className="relative aspect-square flex items-center justify-center bg-white/40 rounded-full shadow-soft backdrop-blur-sm border border-white/50 p-8">
              <img 
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80" 
                alt="Featured Product" 
                className="w-full h-full object-contain rounded-2xl drop-shadow-2xl hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-16">
        
        {/* 2. TRUST BADGES BAR */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 md:p-8 -mt-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-primary flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-dark text-sm">Free Shipping</h3>
                <p className="text-xs text-neutral">On orders over ₹499</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-primary flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-dark text-sm">Secure Payment</h3>
                <p className="text-xs text-neutral">100% secure payment</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-primary flex-shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-dark text-sm">Easy Returns</h3>
                <p className="text-xs text-neutral">30 days return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-primary flex-shrink-0">
                <HeadphonesIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-dark text-sm">24/7 Support</h3>
                <p className="text-xs text-neutral">Dedicated support</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SHOP BY CATEGORIES */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark">Shop by Categories</h2>
            <Link to="/shop" className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors">
              View All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex overflow-x-auto pb-4 hide-scrollbar gap-6 snap-x">
            {CATEGORIES.map((cat, idx) => (
              <Link 
                key={idx} 
                to={`/shop?category=${cat.name}`}
                className="flex flex-col items-center gap-3 min-w-[120px] snap-start group"
              >
                <div className={`w-28 h-28 rounded-full ${cat.color} flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow`}>
                  <img 
                    src={cat.img} 
                    alt={cat.name} 
                    onError={(e) => {
                      console.error(`Failed to load image for category: ${cat.name}, path: ${cat.img}`);
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=150&q=80';
                    }}
                    className="w-20 h-20 object-cover rounded-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <span className="text-sm font-bold text-neutral-dark text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. BEST SELLING PRODUCTS */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark">Best Selling Products</h2>
            <Link to="/shop" className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5].map((skeleton) => (
                <div key={skeleton} className="animate-pulse bg-white rounded-2xl p-4 h-[350px] border border-neutral-light flex flex-col">
                  <div className="bg-neutral-light rounded-xl h-40 mb-4 w-full"></div>
                  <div className="bg-neutral-light h-4 w-3/4 rounded mb-2"></div>
                  <div className="bg-neutral-light h-4 w-1/2 rounded mb-6"></div>
                  <div className="mt-auto bg-neutral-light h-10 w-full rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
              <h3 className="text-xl font-bold text-red-600 mb-2">Failed to load products</h3>
              <p className="text-red-500 mb-6 max-w-md mx-auto">{error.message || 'An unexpected error occurred while fetching products.'}</p>
              <button 
                onClick={refetch}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {products.slice(0, 5).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* 5. SPECIAL OFFER BANNER */}
        <section className="bg-accent rounded-3xl overflow-hidden relative shadow-soft">
          <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12 lg:p-16">
            <div className="flex-1 space-y-4 md:pr-8 mb-8 md:mb-0 relative z-10">
              <span className="text-sm font-bold text-neutral uppercase tracking-wider">Special Offer</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-dark leading-tight">
                Up to <span className="text-primary">50% Off</span>
              </h2>
              <p className="text-neutral text-base md:text-lg max-w-md">
                Limited time offer on selected items. Hurry up and grab the best deals before they are gone!
              </p>
              <div className="pt-4">
                <Link to="/shop?sale=true" className="inline-flex bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors items-center gap-2">
                  Shop the Sale <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="flex-1 relative w-full h-full flex justify-center md:justify-end">
              <img 
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80" 
                alt="Special Offer" 
                className="w-full max-w-sm object-cover rounded-2xl drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </section>

        {/* 6. TESTIMONIALS */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark">What Our Customers Say</h2>
          </div>
          
          <div className="relative">
            <button className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-neutral hover:text-primary transition-colors border border-neutral-light hidden md:flex">
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial) => (
                <div key={testimonial.id} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-light hover:shadow-soft transition-shadow">
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />
                  <p className="text-neutral text-sm leading-relaxed mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-neutral-dark text-sm">{testimonial.name}</h4>
                      <div className="flex text-amber-400">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-neutral hover:text-primary transition-colors border border-neutral-light hidden md:flex">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
