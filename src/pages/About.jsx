import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Users, 
  Award, 
  HeartHandshake, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  Building2,
  Clock,
  ChevronDown,
  Star,
  MapPin,
  Flame,
  Check
} from 'lucide-react';

const STATS = [
  { value: '200+', label: 'Verified Products', sub: 'Across 6 curated departments', icon: PackageCheck, color: 'text-emerald-700 bg-emerald-100' },
  { value: '15,000+', label: 'Delighted Shoppers', sub: 'Pan-India customer base', icon: Users, color: 'text-blue-700 bg-blue-100' },
  { value: '99.4%', label: 'On-Time Dispatch', sub: 'Same-day courier handoff', icon: Truck, color: 'text-[#5C6B4A] bg-[#5C6B4A]/15' },
  { value: '4.8 ★', label: 'Average Rating', sub: 'From 12,400+ verified reviews', icon: Star, color: 'text-amber-700 bg-amber-100' },
];

const OPERATION_TABS = [
  {
    id: 'sourcing',
    label: 'Direct Sourcing',
    title: 'Zero Middlemen. 100% Brand Certified.',
    desc: 'We procure all inventory directly from authorized brand manufacturers, licensed Indian distributors, and tested global creators. Every single piece is tracked with genuine serial barcodes.',
    image: '/images/categories/fashion.jpg',
    points: ['Direct factory & distributor tie-ups', 'Manufacturer warranty backed', 'Batch-tested authenticity checks'],
    badge: 'Authentic First'
  },
  {
    id: 'inspection',
    label: 'Quality Lab',
    title: '3-Tier Physical Quality Inspection',
    desc: 'Before any product enters our shelves, our quality assurance team tests packaging integrity, verifies model numbers, and applies an untamperable holographic security seal.',
    image: '/images/categories/electronics.jpg',
    points: ['Optical & structural integrity checks', 'Tamper-evident holographic sealing', 'Climate-controlled warehouse storage'],
    badge: 'Lab Verified'
  },
  {
    id: 'dispatch',
    label: 'Express Hubs',
    title: 'Automated Hyderabad & Bengaluru Hubs',
    desc: 'Our state-of-the-art regional fulfillment centers feature automated barcode sorting and express courier docks for BlueDart, Delhivery, and DTDC to ensure instant dispatch.',
    image: '/images/categories/home-kitchen.jpg',
    points: ['Same-day dispatch for orders before 2 PM', 'Direct airport logistics connectivity', 'Automated weigh-and-pack lines'],
    badge: 'Lightning Fast'
  },
  {
    id: 'delivery',
    label: 'Safe Doorstep',
    title: 'Protected, Eco-Friendly Unboxing',
    desc: 'We utilize shock-absorbent, 100% recyclable corrugated packaging designed to keep your gadgets, luxury apparel, and home essentials pristine during long transit.',
    image: '/images/categories/accessories.jpg',
    points: ['Reinforced heavy-duty carton packing', 'Live SMS & WhatsApp transit updates', 'Contactless delivery with OTP verification'],
    badge: 'Pristine Arrival'
  }
];

const TIMELINE = [
  {
    year: '2023',
    title: 'Founded in Hyderabad',
    desc: 'ShopMate was born in a small commercial space in Hyderabad with just 20 curated gadgets and a mission to eliminate deceptive online e-commerce listings.',
    tag: 'The Inception'
  },
  {
    year: '2024',
    title: '6 Core Departments & 5K Customers',
    desc: 'Expanded into Fashion, Home, Beauty, and Sports. Scaled warehouse operations and crossed 5,000 delighted buyers with a 98% repeat purchase intent.',
    tag: 'Rapid Scale'
  },
  {
    year: '2025',
    title: 'Logistics Overhaul & Express Hubs',
    desc: 'Integrated direct API links with BlueDart and Delhivery. Achieved same-day dispatch and established secondary fulfillment hubs for express metro delivery.',
    tag: 'Fulfillment 2.0'
  },
  {
    year: '2026',
    title: '200+ Products & 15,000+ Shoppers',
    desc: 'Today, ShopMate serves customers across 19,000+ Indian pincodes with instant UPI refunds, 7-day hassle-free returns, and an industry-leading 4.8★ rating.',
    tag: 'Present Day'
  }
];

const REVIEWS = [
  {
    name: 'Gowtham Reddy',
    location: 'Hyderabad, Telangana',
    text: 'ShopMate is my go-to for gadgets and apparel. Packaging is always pristine, delivery arrives in 2 days, and customer support resolves queries in minutes!',
    rating: 5,
    product: 'boAt Rockerz & Designer Handbag'
  },
  {
    name: 'Pooja Sharma',
    location: 'Bengaluru, Karnataka',
    text: 'I was hesitant to buy luxury accessories online, but ShopMate’s quality verification seal and quick COD payment gave me complete peace of mind.',
    rating: 5,
    product: 'Polarized Sunglasses'
  },
  {
    name: 'Arjun Mehta',
    location: 'Mumbai, Maharashtra',
    text: 'Returned a shirt that was the wrong size and got my replacement within 48 hours without any back-and-forth arguments. Super smooth experience!',
    rating: 5,
    product: 'Oxford Cotton Shirt'
  }
];

const FAQS = [
  {
    q: 'How does ShopMate guarantee that products are 100% authentic?',
    a: 'We bypass intermediaries and procure directly from verified brand manufacturers and authorized Indian distributors. Every product comes with valid brand warranty and a tamper-evident holographic seal.'
  },
  {
    q: 'Where are your fulfillment centers located?',
    a: 'Our primary fulfillment hubs are located in Hyderabad (Hitec City) and Bengaluru, equipped with automated sorting conveyor belts and direct courier dispatch docks.'
  },
  {
    q: 'What is your delivery speed across India?',
    a: 'Metro cities receive their parcels within 2–3 business days. Tier-2 and tier-3 cities are delivered within 3–5 business days via express courier partners BlueDart, Delhivery, and DTDC.'
  },
  {
    q: 'What if I am unhappy with my purchase?',
    a: 'We offer an unconditional 7-day return and exchange policy. Request a return online, and our courier will pick it up from your doorstep for free, followed by an immediate refund.'
  }
];

const About = () => {
  const [activeTab, setActiveTab] = useState('sourcing');
  const [expandedFaq, setExpandedFaq] = useState(0);

  const selectedOp = OPERATION_TABS.find((t) => t.id === activeTab) || OPERATION_TABS[0];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-neutral-800 pb-24 overflow-hidden">
      
      {/* ========================================================= */}
      {/* 1. CINEMATIC ANIMATED HERO WITH GLOW ORBS */}
      {/* ========================================================= */}
      <div className="relative bg-white border-b border-neutral-200/80 pt-20 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#5C6B4A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#5C6B4A]/10 text-[#5C6B4A] border border-[#5C6B4A]/20 shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Delivering Across 19,000+ Indian Pincodes</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black text-neutral-900 tracking-tight leading-[1.15]"
          >
            Redefining Online Shopping With{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5C6B4A] via-[#48543a] to-emerald-700">
              Uncompromising Trust
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            ShopMate was founded to eliminate deceptive product listings and erratic logistics. We bring you hand-inspected, genuine products with same-day dispatch and zero-hassle returns.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-3"
          >
            <Link
              to="/shop"
              className="px-8 py-3.5 bg-[#5C6B4A] hover:bg-[#48543a] text-white font-extrabold text-sm rounded-2xl transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Explore The Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#operations"
              className="px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-sm rounded-2xl transition-colors"
            >
              How We Work
            </a>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 space-y-20">
        
        {/* ========================================================= */}
        {/* 2. INTERACTIVE ANIMATED STATS CARDS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs hover:shadow-xl transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${stat.color} shadow-xs transition-transform group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight mb-1">
                  {stat.value}
                </h3>
                <p className="text-xs sm:text-sm font-extrabold text-neutral-800">{stat.label}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{stat.sub}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* 3. INTERACTIVE "INSIDE SHOPMATE" OPERATIONS SHOWCASE */}
        {/* ========================================================= */}
        <div id="operations" className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs space-y-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5C6B4A] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> The ShopMate Standard
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
                How We Deliver Perfection Every Time
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-sm">
              Click through the 4 operational pillars that ensure every package you receive exceeds expectations.
            </p>
          </div>

          {/* Interactive Navigation Pills */}
          <div className="flex flex-wrap gap-2">
            {OPERATION_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#5C6B4A] text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Display with Framer Motion AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedOp.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2"
            >
              {/* Text Info */}
              <div className="lg:col-span-7 space-y-5">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-[#5C6B4A]/10 text-[#5C6B4A]">
                  <Sparkles className="w-3.5 h-3.5" /> {selectedOp.badge}
                </span>

                <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 leading-snug">
                  {selectedOp.title}
                </h3>

                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                  {selectedOp.desc}
                </p>

                <div className="space-y-3 pt-2">
                  {selectedOp.points.map((pt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-neutral-800">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Realistic High-Res Image with floating badges */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl h-80 sm:h-96 bg-neutral-100 border-4 border-white">
                  <img
                    src={selectedOp.image}
                    alt={selectedOp.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Floating Glassmorphic Pill */}
                  <div className="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50 text-neutral-900">
                    <p className="text-xs font-black flex items-center gap-1.5 text-[#5C6B4A]">
                      <ShieldCheck className="w-4 h-4" /> ShopMate Verified Seal
                    </p>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      Inspected, sealed, and approved by our fulfillment specialists in Hyderabad.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ========================================================= */}
        {/* 4. OUR GROWTH & EVOLUTION JOURNEY (TIMELINE) */}
        {/* ========================================================= */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C6B4A]">Our Journey</span>
            <h2 className="text-3xl font-black text-neutral-900">From Local Roots to Pan-India Trust</h2>
            <p className="text-xs sm:text-sm text-neutral-500">How steady commitment to quality transformed our growth</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {TIMELINE.map((item, index) => (
              <motion.div
                key={item.year}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-[#5C6B4A]">{item.year}</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600">
                      {item.tag}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-neutral-900 text-base mb-2">{item.title}</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Milestone Achieved
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. VERIFIED CUSTOMER VOICES */}
        {/* ========================================================= */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C6B4A]">Customer Testimonials</span>
            <h2 className="text-3xl font-black text-neutral-900">Loved by Thousands Across India</h2>
            <p className="text-xs sm:text-sm text-neutral-500">Real feedback from verified buyers who experience ShopMate daily</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-7 border border-neutral-200/80 shadow-xs flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium">
                    "{rev.text}"
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-neutral-900 text-sm">{rev.name}</h5>
                    <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#5C6B4A]" /> {rev.location}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified Buyer
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. INTERACTIVE FAQS ACCORDION */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C6B4A]">Common Questions</span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900">Frequently Asked About ShopMate</h2>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQS.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-neutral-200 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? -1 : index)}
                    className="w-full p-5 text-left font-bold text-sm sm:text-base text-neutral-900 flex items-center justify-between gap-4 hover:bg-neutral-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#5C6B4A]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-0 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 bg-neutral-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 7. CINEMATIC CALL TO ACTION BANNER */}
        {/* ========================================================= */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="relative bg-gradient-to-br from-[#404c32] via-[#5C6B4A] to-[#36402a] rounded-3xl p-8 sm:p-14 text-white overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8"
        >
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 text-center sm:text-left relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20">
              <Flame className="w-3.5 h-3.5 text-amber-300" /> Start Your Journey Today
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Experience ShopMate?
            </h3>
            <p className="text-white/80 text-xs sm:text-sm max-w-lg leading-relaxed">
              Explore 200+ handpicked products across electronics, fashion, home essentials, beauty, and accessories with free shipping above ₹499.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              to="/shop"
              className="px-9 py-4 bg-white text-[#5C6B4A] hover:bg-neutral-100 rounded-2xl font-black text-sm sm:text-base transition-all shadow-xl hover:shadow-2xl flex items-center gap-2.5 group"
            >
              <span>Shop All Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default About;
