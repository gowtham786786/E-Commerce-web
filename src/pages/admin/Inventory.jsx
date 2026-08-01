import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { FileText, Search, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchInventory = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const productList = [];
      snapshot.forEach(doc => productList.push({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockUpdate = async (id, currentStock, change) => {
    const newStock = Math.max(0, currentStock + change);
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, 'products', id), { stock: newStock });
      setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
      toast.success('Stock updated');
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error('Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Inventory Management
          </h1>
          <p className="text-neutral mt-1">Track and manage your product stock levels.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-light flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral">Total Products</p>
            <h3 className="text-2xl font-bold text-neutral-dark">{products.length}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-light flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral">Low Stock (&lt; 10)</p>
            <h3 className="text-2xl font-bold text-neutral-dark">{products.filter(p => p.stock > 0 && p.stock < 10).length}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-light flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral">Out of Stock</p>
            <h3 className="text-2xl font-bold text-neutral-dark">{products.filter(p => p.stock === 0).length}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-light overflow-hidden">
        <div className="p-4 border-b border-neutral-light bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 text-neutral absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-light rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
            />
          </div>
        </div>

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
                  <th className="p-4 font-semibold whitespace-nowrap text-center">Status</th>
                  <th className="p-4 font-semibold whitespace-nowrap text-center">Current Stock</th>
                  <th className="p-4 font-semibold text-right whitespace-nowrap">Update Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-accent-light/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-neutral-light/50 overflow-hidden border border-neutral-light shrink-0">
                            {product.thumbnail || product.images?.[0] ? (
                              <img src={product.thumbnail || product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral"><FileText className="w-4 h-4" /></div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-dark line-clamp-1">{product.name}</p>
                            <p className="text-xs text-neutral">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-neutral">{product.sku || 'N/A'}</td>
                      <td className="p-4 text-center">
                        {product.stock > 10 ? (
                          <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">In Stock</span>
                        ) : product.stock > 0 ? (
                          <span className="inline-flex px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold flex-nowrap items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold flex-nowrap items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center text-lg font-bold text-neutral-dark">
                        {product.stock}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 items-center">
                           <button 
                            onClick={() => handleStockUpdate(product.id, product.stock, -1)}
                            disabled={updatingId === product.id || product.stock <= 0}
                            className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                            title="Decrease Stock"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStockUpdate(product.id, product.stock, 1)}
                            disabled={updatingId === product.id}
                            className="w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors disabled:opacity-50"
                            title="Increase Stock"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-neutral">No products found.</td>
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

export default Inventory;
