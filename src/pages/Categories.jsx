import { Link } from 'react-router-dom';
import { CATEGORIES_DATA } from '../data/categoriesData';
import { 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones 
} from 'lucide-react';

const Categories = () => {
  return (
    <div className="min-h-screen bg-[#FBF9F5] pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-neutral-200/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#5C6B4A]/10 text-[#5C6B4A] mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Handpicked Collections
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight mb-4">
            Explore All Categories
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Browse our complete catalog of curated, high-quality products across all departments. Find exactly what you are looking for with verified quality assurance.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES_DATA.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-3xl overflow-hidden border border-neutral-200/80 shadow-xs hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                {/* Image Container with Hover Scale */}
                <div className="relative h-56 sm:h-64 overflow-hidden bg-neutral-100">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  
                  {/* Category Pill Tag */}
                  <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-neutral-800 shadow-sm">
                    {category.count}
                  </span>

                  {/* Title on Image */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl font-black text-white drop-shadow-md">
                      {category.name}
                    </h2>
                    <p className="text-xs text-white/90 font-medium drop-shadow-sm mt-0.5">
                      {category.subtext}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {category.description}
                  </p>

                  {/* Tags */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                      Popular in this department:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {category.tags.map((tag) => (
                        <Link
                          key={tag}
                          to={`/shop?category=${encodeURIComponent(category.slug)}`}
                          className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-[#5C6B4A]/10 hover:text-[#5C6B4A] text-neutral-700 text-xs font-semibold transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <Link
                  to={`/shop?category=${encodeURIComponent(category.slug)}`}
                  className="w-full py-3 px-4 rounded-xl bg-neutral-100 group-hover:bg-[#5C6B4A] text-neutral-800 group-hover:text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md"
                >
                  <span>Explore {category.name}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Value Proposition Highlights */}
        <div className="mt-16 bg-white rounded-3xl border border-neutral-200/80 p-8 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">Free Express Delivery</h4>
                <p className="text-xs text-neutral-500">On all orders above ₹499</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">100% Genuine Items</h4>
                <p className="text-xs text-neutral-500">Direct from certified suppliers</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">7-Day Easy Returns</h4>
                <p className="text-xs text-neutral-500">No questions asked policy</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">Dedicated Support</h4>
                <p className="text-xs text-neutral-500">24/7 customer assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
