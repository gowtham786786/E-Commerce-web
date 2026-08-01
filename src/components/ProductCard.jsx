import { Heart, Star, ShoppingCart, ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/useCartStore';
import useWishlistStore from '../store/useWishlistStore';
import toast from 'react-hot-toast';
import { formatCurrency, convertUsdToInr } from '../utils/formatCurrency';

const ProductCard = ({ product }) => {
  const { addItem } = useCartStore();
  const { toggleItem, checkIsWishlisted } = useWishlistStore();
  
  const isWishlisted = checkIsWishlisted(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem({ ...product, quantity: 1 });
    toast.success('Added to cart!');
  };
  
  const handleToggleWishlist = (e) => {
    e.preventDefault();
    toggleItem(product);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-soft transition-shadow border border-neutral-light overflow-hidden group flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-square bg-accent-light overflow-hidden">
        <Link to={`/product/${product.id}`} className="w-full h-full block">
          {product.images?.[0] || product.thumbnail ? (
            <img 
              src={product.images?.[0] || product.thumbnail} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-neutral-light/50 flex flex-col items-center justify-center text-neutral group-hover:scale-105 transition-transform duration-500">
              <ImageOff className="w-8 h-8 mb-2 opacity-50" />
              <span className="bg-white/80 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">Image coming soon</span>
            </div>
          )}
        </Link>
        {product.newArrival ? (
          <span className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">
            New
          </span>
        ) : product.bestSeller ? (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">
            Best Seller
          </span>
        ) : product.trending ? (
          <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">
            Trending
          </span>
        ) : null}
        <button 
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-neutral hover:text-primary hover:bg-white transition-colors shadow-sm"
          aria-label="Add to wishlist"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-primary text-primary' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors min-h-[44px]">
          <h3 className="font-bold text-neutral-dark text-sm md:text-base line-clamp-2 mb-1">{product.name}</h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-neutral-dark">{product.rating}</span>
          </div>
        </div>

        <div className="text-[10px] font-medium mb-3">
          {(typeof product.stock === 'number' ? product.stock > 10 : product.availabilityStatus === 'In Stock') && <span className="text-emerald-600">● In Stock</span>}
          {(typeof product.stock === 'number' ? (product.stock > 0 && product.stock <= 10) : product.availabilityStatus === 'Low Stock') && <span className="text-amber-500">● Low Stock</span>}
          {(typeof product.stock === 'number' ? product.stock <= 0 : product.availabilityStatus === 'Out of Stock') && <span className="text-red-500">● Out of Stock</span>}
        </div>
        
        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="font-bold text-neutral-dark text-lg">{formatCurrency(convertUsdToInr(product.price))}</span>
            {product.originalPrice && (
              <span className="text-sm text-neutral line-through">{formatCurrency(convertUsdToInr(product.originalPrice))}</span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={typeof product.stock === 'number' ? product.stock <= 0 : product.availabilityStatus === 'Out of Stock'}
            className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
              (typeof product.stock === 'number' ? product.stock <= 0 : product.availabilityStatus === 'Out of Stock')
                ? 'bg-neutral-light text-neutral cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{(typeof product.stock === 'number' ? product.stock <= 0 : product.availabilityStatus === 'Out of Stock') ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
