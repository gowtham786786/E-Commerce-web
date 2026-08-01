import { Link } from 'react-router-dom';
import useWishlistStore from '../store/useWishlistStore';
import useCartStore from '../store/useCartStore';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, convertUsdToInr } from '../utils/formatCurrency';

const Wishlist = () => {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleAddToCart = (item) => {
    addItem({ id: item.productId, ...item, quantity: 1 });
    removeItem(item.productId);
    toast.success('Moved to cart!');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <Heart className="w-20 h-20 text-neutral-light mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-neutral-dark mb-4">Your wishlist is empty</h2>
        <p className="text-neutral mb-8 max-w-md mx-auto">Save your favorite items here and they'll be waiting for you when you're ready to buy.</p>
        <Link 
          to="/shop" 
          className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors"
        >
          Discover Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-neutral-dark mb-8 flex items-center gap-3">
        <Heart className="w-8 h-8 text-primary fill-primary" /> My Wishlist
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(item => (
          <div key={item.productId} className="bg-white rounded-2xl shadow-sm border border-neutral-light p-4 flex flex-col h-full hover:shadow-md transition-shadow group">
            <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-accent-light">
              <Link to={`/product/${item.productId}`}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <button
                onClick={() => removeItem(item.productId)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col">
              <Link to={`/product/${item.productId}`} className="font-bold text-neutral-dark hover:text-primary transition-colors line-clamp-2 mb-2">
                {item.name}
              </Link>
              <div className="text-lg font-extrabold text-neutral-dark mb-4 mt-auto">
                {formatCurrency(convertUsdToInr(item.price))}
              </div>
              
              <button 
                onClick={() => handleAddToCart(item)}
                className="w-full py-2.5 bg-accent-light text-primary border border-primary/20 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white hover:border-primary transition-colors mt-auto"
              >
                <ShoppingCart className="w-4 h-4" /> Move to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
