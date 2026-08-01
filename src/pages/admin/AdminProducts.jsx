import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase';
import { formatCurrency, convertUsdToInr } from '../../utils/formatCurrency';
import { Package, Plus, Pencil, Trash2, X, Image as ImageIcon, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Sports', 'Accessories'];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Electronics',
    stock: '',
    tags: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const openModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
        category: product.category,
        stock: product.stock.toString(),
        tags: product.tags ? product.tags.join(', ') : ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', description: '', price: '', originalPrice: '', category: 'Electronics', stock: '', tags: ''
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setImageFile(null);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let imageUrls = [];
      
      // Upload image if selected
      if (imageFile) {
        const fileRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(fileRef, imageFile);
        const url = await getDownloadURL(snapshot.ref);
        imageUrls.push(url);
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        category: formData.category,
        stock: parseInt(formData.stock),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        // If editing and no new image, keep old ones (handling this requires fetching old images, we'll assume we overwrite or just merge. For simplicity, if no new image, we don't update images array, unless we want to clear it. Let's just update fields and keep old images if no new image is provided.)
        const updateData = { ...productData };
        if (imageUrls.length > 0) {
          updateData.images = imageUrls; // overwrite for simplicity in this MVP
        }
        await updateDoc(doc(db, 'products', editingId), updateData);
        toast.success('Product updated successfully');
      } else {
        // Create new
        productData.images = imageUrls;
        productData.createdAt = serverTimestamp();
        productData.rating = 0;
        
        await addDoc(collection(db, 'products'), productData);
        toast.success('Product added successfully');
      }
      
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-neutral-dark">Products</h1>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-light overflow-hidden">
        <div className="p-4 border-b border-neutral-light">
          <div className="relative max-w-md">
            <input 
              type="text" 
              placeholder="Search products by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <Search className="w-5 h-5 text-neutral absolute left-3 top-1/2 -translate-y-1/2" />
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
                <tr className="bg-accent-light text-neutral-dark text-sm">
                  <th className="p-4 font-semibold">Image</th>
                  <th className="p-4 font-semibold">Product Name</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-accent-light/50 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-lg bg-neutral-light/50 overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral"><ImageIcon className="w-5 h-5" /></div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-neutral-dark max-w-[200px] truncate">{product.name}</td>
                      <td className="p-4 text-sm text-neutral">{product.category}</td>
                      <td className="p-4 text-sm font-bold">{formatCurrency(convertUsdToInr(product.price))}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.stock > 0 ? product.stock : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            aria-label="Edit product"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-neutral">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex justify-between items-center p-6 border-b border-neutral-light">
              <h2 className="text-2xl font-bold text-neutral-dark">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal} className="p-2 text-neutral hover:bg-neutral-light rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-neutral-dark mb-2">Product Name *</label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-neutral-light rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-neutral-dark mb-2">Description *</label>
                  <textarea 
                    required rows="3"
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-neutral-light rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-neutral-dark mb-2">Price (₹) *</label>
                  <input 
                    type="number" step="1" min="0" required
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full border border-neutral-light rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-dark mb-2">Original Price (₹)</label>
                  <input 
                    type="number" step="1" min="0"
                    value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})}
                    className="w-full border border-neutral-light rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-dark mb-2">Category *</label>
                  <select 
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full border border-neutral-light rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-dark mb-2">Stock Quantity *</label>
                  <input 
                    type="number" min="0" required
                    value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}
                    className="w-full border border-neutral-light rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-neutral-dark mb-2">Tags (comma separated)</label>
                  <input 
                    type="text" placeholder="e.g. new, sale, featured"
                    value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})}
                    className="w-full border border-neutral-light rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-neutral-dark mb-2">Product Image</label>
                  <input 
                    type="file" accept="image/*"
                    onChange={e => setImageFile(e.target.files[0])}
                    className="w-full border border-neutral-light rounded-lg p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-accent-light file:text-primary hover:file:bg-accent"
                  />
                  {editingId && !imageFile && (
                    <p className="text-xs text-neutral mt-2">Leave blank to keep existing image.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-light">
                <button 
                  type="button" onClick={closeModal}
                  className="px-6 py-2 rounded-lg font-bold text-neutral hover:bg-neutral-light transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={saving}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                  ) : (
                    'Save Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
