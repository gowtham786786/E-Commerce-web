import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ShoppingCart, Heart, Star, ChevronRight, Minus, Plus, Truck, ArrowLeft, ImageOff } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import useCartStore from '../store/useCartStore';
import useWishlistStore from '../store/useWishlistStore';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import { formatCurrency, convertUsdToInr } from '../utils/formatCurrency';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { toggleItem, checkIsWishlisted } = useWishlistStore();

  const isWishlisted = product ? checkIsWishlisted(product.id) : false;

  const handleAddToCart = () => {
    addItem({ ...product, quantity });
    toast.success('Added to cart!');
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);

          // Fetch related products
          const productsRef = collection(db, 'products');
          const q = query(
            productsRef,
            where('category', '==', productData.category),
            limit(5)
          );

          const relatedSnap = await getDocs(q);
          const related = relatedSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(p => p.id !== productData.id)
            .slice(0, 4); // ensure max 4

          setRelatedProducts(related);
        } else {
          console.log("No such product!");
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    // Reset state when id changes
    setQuantity(1);
    setSelectedImage(0);
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <button
          onClick={() => navigate('/shop')}
          className="text-primary hover:underline flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </button>
      </div>
    );
  }

  const handleQuantityChange = (type) => {
    if (type === 'dec' && quantity > 1) {
      setQuantity(q => q - 1);
    } else if (type === 'inc' && (typeof product.stock === 'number' ? quantity < product.stock : quantity < 10)) {
      setQuantity(q => q + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-neutral mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to={`/shop?category=${product.category}`} className="hover:text-primary transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-neutral-dark font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2">
          <div className="aspect-square rounded-2xl overflow-hidden bg-accent-light mb-4 border border-neutral-light relative">
            {product.images?.[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neutral-light/50 flex flex-col items-center justify-center text-neutral">
                <ImageOff className="w-16 h-16 mb-4 opacity-30" />
                <span className="bg-white/80 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-sm">Image coming soon</span>
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === idx ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="mb-2 text-primary font-medium">{product.category}</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-dark mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{product.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl font-bold text-neutral-dark">{formatCurrency(convertUsdToInr(product.price))}</span>
            {product.originalPrice && (
              <span className="text-xl text-neutral line-through mb-1">{formatCurrency(convertUsdToInr(product.originalPrice))}</span>
            )}
            {product.originalPrice && (
              <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded mb-1 ml-2">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          <p className="text-neutral text-lg mb-8 leading-relaxed">
            {product.description}
          </p>

          <div className="bg-accent rounded-xl p-4 mb-8 flex items-start gap-4">
            <Truck className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-neutral-dark">Free Delivery</p>
              <p className="text-sm text-neutral">Free standard shipping on orders over ₹499.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="font-medium text-neutral-dark">Status:</span>
              {(typeof product.stock === 'number' ? product.stock > 0 : product.availabilityStatus !== 'Out of Stock') ? (
                <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-bold">
                  In Stock {typeof product.stock === 'number' && `(${product.stock} available)`}
                </span>
              ) : (
                <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-bold">Out of Stock</span>
              )}
            </div>

            {(typeof product.stock === 'number' ? product.stock > 0 : product.availabilityStatus !== 'Out of Stock') && (
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <div className="flex items-center border border-neutral-light rounded-xl overflow-hidden h-14 bg-white">
                  <button
                    onClick={() => handleQuantityChange('dec')}
                    className="w-12 h-full flex items-center justify-center text-neutral hover:bg-neutral-light hover:text-neutral-dark transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    readOnly
                    className="w-16 text-center font-semibold text-lg outline-none bg-transparent"
                  />
                  <button
                    onClick={() => handleQuantityChange('inc')}
                    className="w-12 h-full flex items-center justify-center text-neutral hover:bg-neutral-light hover:text-neutral-dark transition-colors"
                    disabled={typeof product.stock === 'number' ? quantity >= product.stock : quantity >= 10}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-14 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>

                <button
                  onClick={() => toggleItem(product)}
                  className="h-14 w-14 flex items-center justify-center border border-neutral-light bg-white rounded-xl text-neutral hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-all shadow-sm active:scale-[0.98]"
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-primary text-primary' : ''}`} />
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              <span className="text-sm font-medium text-neutral-dark self-center mr-2">Tags:</span>
              {product.tags.map(tag => (
                <span key={tag} className="bg-neutral-light text-neutral-dark text-xs px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-neutral-light">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-dark">You May Also Like</h2>
            <Link to={`/shop?category=${product.category}`} className="text-primary hover:underline font-medium flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rp => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
