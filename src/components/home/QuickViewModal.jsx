import { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useCartStore from '../../store/useCartStore';
import useWishlistStore from '../../store/useWishlistStore';
import toast from 'react-hot-toast';
import { formatCurrency, convertUsdToInr } from '../../utils/formatCurrency';

export default function QuickViewModal({ product, onClose }) {
  const { addItem } = useCartStore();
  const { toggleItem, checkIsWishlisted } = useWishlistStore();

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setSelectedImgIdx(0);
    setQuantity(1);
    setAdded(false);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const isWishlisted = checkIsWishlisted(product.id);
  const inrPrice = convertUsdToInr(product.price);
  const originalPrice = product.originalPrice
    ? convertUsdToInr(product.originalPrice)
    : Math.round(inrPrice * 1.25);
  const discountPercent = Math.round(((originalPrice - inrPrice) / originalPrice) * 100);

  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'];

  const isOutOfStock = typeof product.stock === 'number'
    ? product.stock <= 0
    : product.availabilityStatus === 'Out of Stock';

  const handleAddToCart = () => {
    addItem({ ...product, quantity });
    setAdded(true);
    toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart!`);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200/80 z-10 flex flex-col md:flex-row overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Gallery */}
        <div className="md:w-1/2 p-6 sm:p-8 bg-[#FAF8F5] flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-neutral-200/80">
          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-neutral-200/60 mb-4 flex items-center justify-center">
            <img
              src={images[selectedImgIdx] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
              }}
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto py-2 w-full justify-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIdx(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${
                    selectedImgIdx === idx
                      ? 'border-primary ring-2 ring-primary/20 scale-105'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Category & Rating */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                {product.category || 'Curated Essential'}
              </span>
              <div className="flex items-center gap-1.5 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold text-neutral-dark">{product.rating || 4.9}</span>
                <span className="text-xs text-neutral">({product.reviewsCount || 128} reviews)</span>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-dark leading-snug">
              {product.name}
            </h3>

            {/* Price & Discount */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-neutral-dark">
                {formatCurrency(inrPrice)}
              </span>
              {originalPrice > inrPrice && (
                <span className="text-sm text-neutral line-through">
                  {formatCurrency(originalPrice)}
                </span>
              )}
              {discountPercent > 5 && (
                <span className="bg-rose-50 text-rose-600 border border-rose-200/80 text-xs font-black px-2 py-0.5 rounded-full uppercase">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="text-xs font-bold">
              {isOutOfStock ? (
                <span className="text-rose-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  Currently Out of Stock
                </span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  In Stock & Ready to Dispatch
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-neutral leading-relaxed line-clamp-3">
              {product.description ||
                'Crafted with premium materials and ergonomic precision for effortless everyday use. Verified authentic with manufacturer guarantee.'}
            </p>

            {/* Trust highlights */}
            <div className="grid grid-cols-2 gap-3 py-2 border-y border-neutral-100 text-xs text-neutral-dark">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span>Free Express Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-primary" />
                <span>30-Day Hassle-Free Returns</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center border border-neutral-200 rounded-2xl p-1 bg-neutral-50/80">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-8 h-8 rounded-xl bg-white text-neutral-dark font-bold hover:bg-neutral-100 flex items-center justify-center transition-colors disabled:opacity-40"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-neutral-dark">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={isOutOfStock}
                  className="w-8 h-8 rounded-xl bg-white text-neutral-dark font-bold hover:bg-neutral-100 flex items-center justify-center transition-colors disabled:opacity-40"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                  added
                    ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                    : isOutOfStock
                    ? 'bg-neutral-100 text-neutral cursor-not-allowed shadow-none'
                    : 'bg-primary hover:bg-primary-dark text-white shadow-primary/20 hover:shadow-lg active:scale-98'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleItem(product)}
                className={`p-3 rounded-2xl border transition-colors ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-neutral-200 text-neutral hover:text-primary hover:border-primary/40'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* View Full Product Details Link */}
            <Link
              to={`/product/${product.id}`}
              onClick={onClose}
              className="text-xs font-bold text-primary hover:text-primary-dark inline-flex items-center justify-center w-full gap-1 pt-1 transition-colors"
            >
              <span>View full specifications & details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
