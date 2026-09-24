import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  HeadphonesIcon,
  Quote,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  CheckCircle2,
  Clock,
  Flame
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Bag3DViewer from '../components/Bag3DViewer';
import { useProducts } from '../hooks/useProducts';

const CATEGORIES = [
  { name: 'Electronics', count: '50+ Items', color: 'from-blue-500/10 to-blue-500/20', img: '/images/categories/electronics.jpg' },
  { name: 'Fashion', count: '50+ Items', color: 'from-rose-500/10 to-rose-500/20', img: '/images/categories/fashion.jpg' },
  { name: 'Home & Kitchen', count: '50+ Items', color: 'from-amber-500/10 to-amber-500/20', img: '/images/categories/home-kitchen.jpg' },
  { name: 'Beauty', count: '50+ Items', color: 'from-purple-500/10 to-purple-500/20', img: '/images/categories/beauty.jpg' },
  { name: 'Sports', count: '50+ Items', color: 'from-emerald-500/10 to-emerald-500/20', img: '/images/categories/sports.jpg' },
  { name: 'Accessories', count: '50+ Items', color: 'from-orange-500/10 to-orange-500/20', img: '/images/categories/accessories.jpg' },
];

const TESTIMONIALS = [
  {
    id: 1,
    text: "Amazing products and fast delivery! ShopMate is my go-to store for all my everyday essentials.",
    name: "John D.",
    role: "Verified Buyer",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
  },
  {
    id: 2,
    text: "Great quality at unbeatable prices. Customer support helped me resolve an exchange in minutes.",
    name: "Sarah M.",
    role: "Prime Member",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
  },
  {
    id: 3,
    text: "The 3D preview and product quality exceeded my expectations. Highly recommend ShopMate to everyone!",
    name: "Michael T.",
    role: "Verified Buyer",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
  },
];

const Home = () => {
  const { products, loading, error, refetch } = useProducts();
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  // Countdown timer for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNextTestimonial = () => {
    setActiveTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonialIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20 overflow-x-hidden">
      {/* 1. HERO SECTION WITH 3D 360° MODEL VIEWER */}
      <section className="relative bg-gradient-to-b from-accent/70 via-accent/40 to-transparent pt-12 pb-24 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background blur orbs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-40 right-10 w-80 h-80 bg-accent-dark/40 rounded-full filter blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          {/* Left Text Content */}
          <div className="flex-1 space-y-6 text-center lg:text-left z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>New Arrivals &bull; 2026 Season</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-dark tracking-tight leading-[1.12]">
              Discover The Best{' '}
              <span className="text-primary relative inline-block">
                Products
                <span className="absolute bottom-1.5 left-0 w-full h-2.5 bg-primary/20 -z-10 rounded-full" />
              </span>{' '}
              for You
            </h1>

            <p className="text-neutral text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Explore our curated collection of verified, top-tier essentials crafted for your lifestyle.
              Enjoy guaranteed best prices and seamless doorstep delivery.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/shop"
                className="group bg-primary hover:bg-primary-dark text-white px-7 py-3.5 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2.5 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop?sale=true"
                className="bg-white/90 hover:bg-white text-neutral-dark px-7 py-3.5 rounded-2xl font-semibold transition-all duration-300 border border-neutral-200/80 hover:border-neutral-300 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0"
              >
                Explore Deals
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Customer" />
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="Customer" />
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Customer" />
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Customer" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                  <span className="text-xs font-bold text-neutral-dark ml-1">4.9 / 5</span>
                </div>
                <p className="text-xs text-neutral font-medium">
                  Trusted by <span className="font-bold text-neutral-dark">10,000+</span> Happy Shoppers
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D 360-Degree Interactive Bag Viewer */}
          <div className="flex-1 w-full flex items-center justify-center z-10">
            <Bag3DViewer />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-16 md:gap-24">
        {/* 2. FLOATING TRUST BADGES BAR */}
        <section className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-neutral-900/5 border border-neutral-200/80 p-6 md:p-8 -mt-24 md:-mt-28 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="flex items-center gap-4 group p-2 rounded-2xl transition-colors hover:bg-neutral-50/80">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-dark text-sm">Free Express Shipping</h3>
                <p className="text-xs text-neutral">On all orders above ₹499</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group p-2 rounded-2xl transition-colors hover:bg-neutral-50/80">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-dark text-sm">100% Secure Payment</h3>
                <p className="text-xs text-neutral">Encrypted checkout protection</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group p-2 rounded-2xl transition-colors hover:bg-neutral-50/80">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-dark text-sm">30-Day Easy Returns</h3>
                <p className="text-xs text-neutral">Hassle-free exchange policy</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group p-2 rounded-2xl transition-colors hover:bg-neutral-50/80">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <HeadphonesIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-dark text-sm">24/7 Dedicated Support</h3>
                <p className="text-xs text-neutral">Instant chat & call assistance</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SHOP BY CATEGORIES */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Browse Collections</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-dark mt-1">Shop by Categories</h2>
            </div>
            <Link
              to="/shop"
              className="text-sm font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1.5 transition-colors group"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {CATEGORIES.map((cat, idx) => (
              <Link
                key={idx}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center bg-white p-4 rounded-3xl border border-neutral-200/80 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-accent to-accent-dark group-hover:from-primary/30 group-hover:to-primary/10 transition-colors shadow-inner mb-3">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=150&q=80';
                    }}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="text-sm font-bold text-neutral-dark text-center group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
                <span className="text-[11px] font-medium text-neutral mt-0.5">
                  {cat.count}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. BEST SELLING PRODUCTS */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Popular Picks</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-dark">Best Selling Products</h2>
            </div>
            <Link
              to="/shop"
              className="text-sm font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1.5 transition-colors group"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5].map((skeleton) => (
                <div key={skeleton} className="animate-pulse bg-white rounded-3xl p-4 h-[360px] border border-neutral-200/80 flex flex-col">
                  <div className="bg-neutral-100 rounded-2xl h-44 mb-4 w-full" />
                  <div className="bg-neutral-100 h-4 w-3/4 rounded mb-2" />
                  <div className="bg-neutral-100 h-4 w-1/2 rounded mb-6" />
                  <div className="mt-auto bg-neutral-100 h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-50 rounded-3xl border border-red-100 p-8">
              <h3 className="text-lg font-bold text-red-600 mb-2">Unable to load catalog</h3>
              <p className="text-red-500 text-sm mb-6 max-w-md mx-auto">{error.message || 'Error fetching products from server.'}</p>
              <button
                onClick={refetch}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors inline-flex items-center gap-2 shadow-md"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {products.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* 5. SPECIAL OFFER FLASH SALE BANNER */}
        <section className="bg-gradient-to-br from-accent via-accent-light to-accent-dark/30 rounded-3xl overflow-hidden relative shadow-soft border border-neutral-200/80">
          <div className="flex flex-col lg:flex-row items-center justify-between p-8 sm:p-12 lg:p-16 gap-8">
            <div className="flex-1 space-y-5 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-full text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>Limited Time Flash Sale</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-dark leading-tight tracking-tight">
                Up to <span className="text-primary font-black">50% Off</span> Storewide
              </h2>

              <p className="text-neutral text-base sm:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Unlock exclusive seasonal savings on premium sneakers, electronics, and accessories.
                Offer valid while promotional stocks last.
              </p>

              {/* Countdown Ticker */}
              <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
                <div className="bg-white px-3.5 py-2 rounded-2xl shadow-sm border border-neutral-200/80 text-center min-w-[60px]">
                  <span className="block text-lg font-bold text-neutral-dark font-mono">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-neutral uppercase font-semibold">Hours</span>
                </div>
                <span className="text-xl font-bold text-neutral-dark">:</span>
                <div className="bg-white px-3.5 py-2 rounded-2xl shadow-sm border border-neutral-200/80 text-center min-w-[60px]">
                  <span className="block text-lg font-bold text-neutral-dark font-mono">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-neutral uppercase font-semibold">Mins</span>
                </div>
                <span className="text-xl font-bold text-neutral-dark">:</span>
                <div className="bg-white px-3.5 py-2 rounded-2xl shadow-sm border border-neutral-200/80 text-center min-w-[60px]">
                  <span className="block text-lg font-bold text-rose-600 font-mono">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-neutral uppercase font-semibold">Secs</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/shop?sale=true"
                  className="inline-flex bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-2xl font-semibold transition-all duration-300 items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Shop the Sale <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Banner Image */}
            <div className="flex-1 relative w-full flex justify-center lg:justify-end z-10">
              <div className="relative group max-w-md w-full">
                <div className="absolute inset-0 bg-primary/10 rounded-3xl filter blur-2xl transform scale-95" />
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
                  alt="Special Offer Sneaker"
                  className="relative w-full h-auto object-cover rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 6. WHAT OUR CUSTOMERS SAY (TESTIMONIALS) */}
        <section>
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Real Feedback</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-dark mt-1">What Our Customers Say</h2>
            <p className="text-neutral text-sm mt-2">Hear directly from verified shoppers across the globe.</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <button
              onClick={handlePrevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-20 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center text-neutral-dark hover:text-primary transition-all border border-neutral-200/80 hover:scale-105 active:scale-95"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, idx) => (
                <div
                  key={t.id}
                  className={`bg-white p-7 rounded-3xl shadow-sm border transition-all duration-300 flex flex-col justify-between ${
                    idx === activeTestimonialIdx
                      ? 'border-primary ring-2 ring-primary/20 shadow-md scale-[1.02]'
                      : 'border-neutral-200/80 hover:shadow-soft'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Quote className="w-8 h-8 text-primary/30" />
                      <div className="flex text-amber-400">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-neutral-dark/80 text-sm leading-relaxed mb-6 font-medium italic">
                      "{t.text}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3.5 pt-4 border-t border-neutral-100">
                    <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover shadow-sm" />
                    <div>
                      <h4 className="font-bold text-neutral-dark text-sm flex items-center gap-1.5">
                        {t.name}
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100" />
                      </h4>
                      <p className="text-xs text-neutral">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleNextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-20 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center text-neutral-dark hover:text-primary transition-all border border-neutral-200/80 hover:scale-105 active:scale-95"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
