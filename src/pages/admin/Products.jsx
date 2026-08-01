import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { formatCurrency, convertUsdToInr } from '../../utils/formatCurrency';
import { Package, Plus, Pencil, Trash2, Search, Filter, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const productList = [];
      snapshot.forEach(doc => productList.push({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Products
          </h1>
          <p className="text-neutral mt-1">Manage your store's inventory and product catalog.</p>
        </div>
        <Link 
          to="/admin/products/add"
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-light overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-light flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-5 h-5 text-neutral absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-light rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-5 h-5 text-neutral" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-auto border border-neutral-light rounded-xl px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-neutral-light text-neutral-dark text-sm">
                  <th className="p-4 font-semibold whitespace-nowrap">Product</th>
                  <th className="p-4 font-semibold whitespace-nowrap">SKU</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Category</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Price</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Stock</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-accent-light/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-neutral-light/50 overflow-hidden border border-neutral-light shrink-0">
                            {product.thumbnail || product.images?.[0] ? (
                              <img src={product.thumbnail || product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral"><Package className="w-5 h-5" /></div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-dark line-clamp-1">{product.name}</p>
                            {product.brand && <p className="text-xs text-neutral">{product.brand}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-neutral">{product.sku || 'N/A'}</td>
                      <td className="p-4 text-sm text-neutral">{product.category || 'N/A'}</td>
                      <td className="p-4 text-sm font-bold text-neutral-dark">{formatCurrency(convertUsdToInr(product.price))}</td>
                      <td className="p-4 text-sm">
                        {typeof product.stock === 'number' ? (
                          product.stock > 10 ? (
                            <span className="text-green-600 font-medium">{product.stock} in stock</span>
                          ) : product.stock > 0 ? (
                            <span className="text-amber-600 font-medium">Low: {product.stock}</span>
                          ) : (
                            <span className="text-red-600 font-medium">Out of stock</span>
                          )
                        ) : product.availabilityStatus === 'In Stock' ? (
                          <span className="text-green-600 font-medium">In stock</span>
                        ) : product.availabilityStatus === 'Low Stock' ? (
                          <span className="text-amber-600 font-medium">Low stock</span>
                        ) : (
                          <span className="text-red-600 font-medium">Out of stock</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          product.status === 'published' ? 'bg-green-100 text-green-700' : 
                          product.status === 'draft' ? 'bg-neutral-light text-neutral-dark' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {product.status || 'published'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Link
                            to={`/product/${product.id}`}
                            target="_blank"
                            className="p-2 text-neutral hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link 
                            to={`/admin/products/edit/${product.id}`}
                            className="p-2 text-neutral hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-neutral hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="w-12 h-12 text-neutral-light mb-3" />
                        <p className="text-neutral-dark font-medium text-lg">No products found.</p>
                        <p className="text-neutral text-sm">Try adjusting your search or add a new product.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Products;
