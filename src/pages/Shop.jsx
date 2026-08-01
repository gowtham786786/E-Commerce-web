import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { convertUsdToInr } from '../utils/formatCurrency';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import EmptyState from '../components/EmptyState';
import { Filter, X, ChevronDown, Star, SearchX, PackageOpen } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating', value: 'rating' }
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, refetch } = useProducts();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter & Sort State
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 24;

  // Dynamically compute categories from fetched products
  const availableCategories = useMemo(() => {
    if (!products || products.length === 0) return ['All'];
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats).sort()];
  }, [products]);

  // Initial load - sync URL params to state
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearchQuery(searchParam);
  }, [searchParams]);

  // Update URL params when category or search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }
    
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    
    setSearchParams(params);
  }, [selectedCategory, searchQuery, setSearchParams]);

  // Client-side filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        (p.description && p.description.toLowerCase().includes(lowerQuery)) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      );
    }

    // Price filter (priceRange is in INR, p.price is in USD)
    result = result.filter(p => convertUsdToInr(p.price) >= priceRange[0] && convertUsdToInr(p.price) <= priceRange[1]);

    // Rating filter
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        result.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, priceRange, minRating, sortBy]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery, priceRange, minRating, sortBy]);

  const paginatedProducts = useMemo(() => {
    return filteredAndSortedProducts.slice(0, page * ITEMS_PER_PAGE);
  }, [filteredAndSortedProducts, page]);

  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = Number(e.target.value);
    setPriceRange(newRange);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark mb-2">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Shop All Products'}
          </h1>
          <p className="text-neutral">
            Showing {filteredAndSortedProducts.length} results
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-neutral-light rounded-lg hover:bg-neutral-light/50 transition-colors"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
          
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-neutral-light text-neutral-dark py-2 pl-4 pr-10 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer shadow-sm"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral" />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`
          fixed md:relative top-0 left-0 h-full md:h-auto w-[280px] md:w-1/4 bg-white md:bg-transparent z-50 md:z-0
          p-6 md:p-0 border-r md:border-r-0 border-neutral-light overflow-y-auto shadow-2xl md:shadow-none
          transition-transform duration-300 ease-in-out
          ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex items-center justify-between md:hidden mb-6">
            <h2 className="text-xl font-bold">Filters</h2>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 hover:bg-neutral-light rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4 text-neutral-dark border-b border-neutral-light pb-2">Categories</h3>
            <ul className="space-y-2">
              {availableCategories.map(category => (
                <li key={category}>
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsMobileFiltersOpen(false);
                    }}
                    className={`text-left w-full transition-colors ${selectedCategory === category ? 'text-primary font-medium' : 'text-neutral hover:text-primary'}`}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4 text-neutral-dark border-b border-neutral-light pb-2">Price Range</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-xs text-neutral mb-1 block">Min (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    max={priceRange[1]}
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange(e, 0)}
                    className="w-full border border-neutral-light rounded-lg p-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <span className="text-neutral mt-4">-</span>
                <div className="flex-1">
                  <label className="text-xs text-neutral mb-1 block">Max (₹)</label>
                  <input 
                    type="number"
                    min={priceRange[0]}
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(e, 1)}
                    className="w-full border border-neutral-light rounded-lg p-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4 text-neutral-dark border-b border-neutral-light pb-2">Minimum Rating</h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map(rating => (
                <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="rating" 
                    checked={minRating === rating}
                    onChange={() => setMinRating(rating)}
                    className="accent-primary"
                  />
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-light'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-neutral group-hover:text-primary transition-colors">& Up</span>
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer group mt-2">
                <input 
                  type="radio" 
                  name="rating" 
                  checked={minRating === 0}
                  onChange={() => setMinRating(0)}
                  className="accent-primary"
                />
                <span className="text-sm text-neutral group-hover:text-primary transition-colors">Any Rating</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Overlay */}
        {isMobileFiltersOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
        )}

        {/* Product Grid */}
        <main className="w-full md:w-3/4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
              <h3 className="text-xl font-bold text-red-600 mb-2">Failed to load products</h3>
              <p className="text-red-500 mb-6 max-w-md mx-auto">{error.message || 'An unexpected error occurred while fetching products.'}</p>
              <button 
                onClick={refetch}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-colors mx-auto"
              >
                Try Again
              </button>
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {filteredAndSortedProducts.length > paginatedProducts.length && (
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => setPage(p => p + 1)}
                    className="px-8 py-3 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-colors"
                  >
                    Load More Products
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-light h-full min-h-[50vh] flex flex-col items-center justify-center">
              {products.length === 0 ? (
                <EmptyState 
                  icon={PackageOpen}
                  title="No products available yet"
                  description="Check back later for new arrivals."
                  actionLabel=""
                  actionLink={null}
                />
              ) : (
                <>
                  <EmptyState 
                    icon={SearchX}
                    title="No products found"
                    description="Try adjusting your filters or search query to find what you're looking for."
                    actionLabel="Clear All Filters"
                    actionLink={null}
                  />
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setPriceRange([0, 200000]);
                      setMinRating(0);
                    }}
                    className="mt-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium -translate-y-8"
                  >
                    Reset Filters
                  </button>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
