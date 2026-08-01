import { useState, useEffect } from 'react';
import { Upload, X, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../../firebase/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { convertUsdToInr, USD_TO_INR } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const INITIAL_STATE = {
  name: '', description: '', brand: '', category: '', subCategory: '', 
  price: '', discount: '', gst: '', stock: '', sku: '', 
  weight: '', dimensions: '', colors: '', sizes: '', tags: '',
  featured: false, trending: false, bestSeller: false, status: 'published',
  metaTitle: '', metaDescription: '', thumbnail: '', images: []
};

const ProductForm = ({ initialData = null, isEditing = false, productId = null }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...INITIAL_STATE,
        ...initialData,
        price: initialData.price ? Math.round(convertUsdToInr(initialData.price)) : '',
        colors: initialData.colors?.join(', ') || '',
        sizes: initialData.sizes?.join(', ') || '',
        tags: initialData.tags?.join(', ') || ''
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch from categories collection
        const catSnap = await getDocs(collection(db, 'categories'));
        let cats = [];
        catSnap.forEach(doc => cats.push(doc.data().name));

        // Fetch distinct categories from products to ensure all existing categories are available
        const prodSnap = await getDocs(collection(db, 'products'));
        prodSnap.forEach(doc => {
          const cat = doc.data().category;
          if (cat && !cats.includes(cat)) {
            cats.push(cat);
          }
        });

        // Add defaults if they don't exist
        const defaults = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Toys', 'Books', 'Groceries', 'Accessories'];
        defaults.forEach(cat => {
          if (!cats.includes(cat)) cats.push(cat);
        });

        setCategories(cats.sort());
      } catch (error) {
        console.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e, isThumbnail = false) => {
    const files = Array.from(e.target.files);
    if (isThumbnail) {
      setThumbnailFile(files[0]);
    } else {
      const totalCurrentImages = (formData.images?.length || 0) + imageFiles.length;
      if (totalCurrentImages + files.length > 5) {
        toast.error("You can upload up to 5 gallery images only.");
        const allowedFiles = files.slice(0, 5 - totalCurrentImages);
        if (allowedFiles.length > 0) {
          setImageFiles(prev => [...prev, ...allowedFiles]);
        }
      } else {
        setImageFiles(prev => [...prev, ...files]);
      }
    }
  };

  const removeImageFile = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let thumbnailUrl = formData.thumbnail;
      const imageUrls = [...(formData.images || [])];

      // Upload Thumbnail
      if (thumbnailFile) {
        const thumbRef = ref(storage, `products/thumb_${Date.now()}_${thumbnailFile.name}`);
        const snapshot = await uploadBytes(thumbRef, thumbnailFile);
        thumbnailUrl = await getDownloadURL(snapshot.ref);
      }

      // Upload Multiple Images
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileRef = ref(storage, `products/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(fileRef, file);
          const url = await getDownloadURL(snapshot.ref);
          imageUrls.push(url);
        }
      }

        const parsedStock = parseInt(formData.stock) || 0;
        let derivedStatus = 'Out of Stock';
        if (parsedStock > 10) derivedStatus = 'In Stock';
        else if (parsedStock > 0) derivedStatus = 'Low Stock';

        const productData = {
          ...formData,
          price: (parseFloat(formData.price) || 0) / USD_TO_INR,
          discount: parseFloat(formData.discount) || 0,
          gst: parseFloat(formData.gst) || 0,
          stock: parsedStock,
          availabilityStatus: derivedStatus,
          colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        thumbnail: thumbnailUrl,
        images: imageUrls,
        updatedAt: serverTimestamp()
      };

      if (isEditing && productId) {
        await updateDoc(doc(db, 'products', productId), productData);
        toast.success('Product updated successfully!');
      } else {
        productData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'products'), productData);
        toast.success('Product added successfully!');
      }
      
      navigate('/admin/products');
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-neutral-light">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => navigate('/admin/products')}
            className="p-2 hover:bg-neutral-light rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-dark" />
          </button>
          <h2 className="text-xl font-bold text-neutral-dark">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            type="button" 
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2.5 rounded-xl font-medium text-neutral-dark hover:bg-neutral-light transition-colors flex-1 sm:flex-none border border-neutral-light"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex flex-1 sm:flex-none items-center justify-center gap-2 shadow-sm shadow-primary/20 disabled:opacity-70"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            {isEditing ? 'Save Changes' : 'Publish Product'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
            <h3 className="text-lg font-bold text-neutral-dark mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Product Name *</label>
                <input 
                  type="text" name="name" required value={formData.name} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Description</label>
                <textarea 
                  name="description" rows="5" value={formData.description} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                  placeholder="Detailed product description..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">Brand</label>
                  <input 
                    type="text" name="brand" value={formData.brand} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. Sony"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">SKU *</label>
                  <input 
                    type="text" name="sku" required value={formData.sku} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. SNY-WH1000XM4"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
            <h3 className="text-lg font-bold text-neutral-dark mb-4">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Price (₹) *</label>
                <input 
                  type="number" name="price" min="0" required value={formData.price} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Discount (%)</label>
                <input 
                  type="number" name="discount" min="0" max="100" value={formData.discount} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">GST (%)</label>
                <input 
                  type="number" name="gst" min="0" value={formData.gst} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Stock *</label>
                <div className="flex items-center border border-neutral-light rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, stock: Math.max(0, (parseInt(prev.stock) || 0) - 1) }))}
                    className="w-10 h-full min-h-[46px] flex items-center justify-center bg-accent-light text-neutral hover:bg-accent transition-colors font-bold text-lg"
                  >
                    -
                  </button>
                  <input 
                    type="number" name="stock" min="0" required value={formData.stock} onChange={handleChange}
                    className="w-full px-2 py-2.5 outline-none text-center font-medium hide-number-spinners"
                  />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, stock: (parseInt(prev.stock) || 0) + 1 }))}
                    className="w-10 h-full min-h-[46px] flex items-center justify-center bg-accent-light text-neutral hover:bg-accent transition-colors font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Variants & Specifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
            <h3 className="text-lg font-bold text-neutral-dark mb-4">Variants & Specs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Colors (comma separated)</label>
                <input 
                  type="text" name="colors" value={formData.colors} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Red, Blue, Black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Sizes (comma separated)</label>
                <input 
                  type="text" name="sizes" value={formData.sizes} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="S, M, L, XL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Weight (e.g. 500g)</label>
                <input 
                  type="text" name="weight" value={formData.weight} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Dimensions (LxWxH)</label>
                <input 
                  type="text" name="dimensions" value={formData.dimensions} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* SEO Meta */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
            <h3 className="text-lg font-bold text-neutral-dark mb-4">SEO Meta</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Meta Title</label>
                <input 
                  type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Meta Description</label>
                <textarea 
                  name="metaDescription" rows="3" value={formData.metaDescription} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Tags (comma separated)</label>
                <input 
                  type="text" name="tags" value={formData.tags} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="summer, sale, new arrival"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Organization & Images */}
        <div className="space-y-8">
          
          {/* Organization */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
            <h3 className="text-lg font-bold text-neutral-dark mb-4">Organization</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Status</label>
                <select 
                  name="status" value={formData.status} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Category *</label>
                <select 
                  name="category" required value={formData.category} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Sub Category</label>
                <input 
                  type="text" name="subCategory" value={formData.subCategory} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-3 pt-6 border-t border-neutral-light">
              <label className="flex items-center gap-3 p-3 border border-neutral-light rounded-xl hover:bg-neutral-light/30 cursor-pointer transition-colors">
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                <span className="text-sm font-medium text-neutral-dark">Featured Product</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-neutral-light rounded-xl hover:bg-neutral-light/30 cursor-pointer transition-colors">
                <input type="checkbox" name="trending" checked={formData.trending} onChange={handleChange} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                <span className="text-sm font-medium text-neutral-dark">Trending Product</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-neutral-light rounded-xl hover:bg-neutral-light/30 cursor-pointer transition-colors">
                <input type="checkbox" name="bestSeller" checked={formData.bestSeller} onChange={handleChange} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                <span className="text-sm font-medium text-neutral-dark">Best Seller</span>
              </label>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
            <h3 className="text-lg font-bold text-neutral-dark mb-4">Thumbnail Image</h3>
            <div className="border-2 border-dashed border-neutral-light rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
              {(thumbnailFile || formData.thumbnail) ? (
                <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-neutral-light mb-4">
                  <img 
                    src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : formData.thumbnail} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-cover"
                  />
                  <button type="button" onClick={() => { setThumbnailFile(null); setFormData({...formData, thumbnail: ''}); }} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg shadow-sm hover:bg-red-600 transition-colors"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="py-8">
                  <ImageIcon className="w-10 h-10 text-neutral mx-auto mb-2" />
                  <p className="text-sm text-neutral-dark font-medium">Upload Thumbnail</p>
                  <p className="text-xs text-neutral mt-1">1080x1080 recommended</p>
                </div>
              )}
              <input type="file" id="thumbnail-upload" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, true)} />
              <label htmlFor="thumbnail-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-accent-light text-primary font-medium rounded-lg cursor-pointer hover:bg-accent transition-colors text-sm">
                <Upload className="w-4 h-4" /> Choose File
              </label>
            </div>
          </div>

          {/* Multiple Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
            <h3 className="text-lg font-bold text-neutral-dark mb-1">Gallery Images</h3>
            <p className="text-xs text-neutral mb-4">Up to 5 images from different angles</p>
            
            {/* Existing Images */}
            {formData.images?.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-light group">
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData({...formData, images: formData.images.filter((_, i) => i !== idx)})} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
            
            {/* New Images */}
            {imageFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {imageFiles.map((file, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-primary group">
                    <img src={URL.createObjectURL(file)} alt={`New ${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImageFile(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}

            {((formData.images?.length || 0) + imageFiles.length) < 5 && (
              <div className="border-2 border-dashed border-neutral-light rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
                <input type="file" id="gallery-upload" className="hidden" accept="image/*" multiple onChange={(e) => handleImageChange(e, false)} />
                <label htmlFor="gallery-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-accent-light text-primary font-medium rounded-lg cursor-pointer hover:bg-accent transition-colors text-sm">
                  <Upload className="w-4 h-4" /> Add Images
                </label>
              </div>
            )}
          </div>

        </div>
      </div>
    </form>
  );
};

export default ProductForm;
