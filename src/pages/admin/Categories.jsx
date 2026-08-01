import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase';
import { Layers, Plus, Pencil, Trash2, X, Image as ImageIcon, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', status: 'enabled' });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      const catList = [];
      snapshot.forEach(doc => catList.push({ id: doc.id, ...doc.data() }));
      setCategories(catList);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({ name: category.name, status: category.status || 'enabled' });
    } else {
      setEditingId(null);
      setFormData({ name: '', status: 'enabled' });
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
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error('Failed to delete category');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let imageUrl = null;
      if (imageFile) {
        const fileRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(fileRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const categoryData = {
        name: formData.name,
        status: formData.status,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        if (imageUrl) categoryData.image = imageUrl;
        await updateDoc(doc(db, 'categories', editingId), categoryData);
        toast.success('Category updated successfully');
      } else {
        categoryData.image = imageUrl;
        categoryData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'categories'), categoryData);
        toast.success('Category added successfully');
      }
      
      closeModal();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Layers className="w-8 h-8 text-primary" />
            Categories
          </h1>
          <p className="text-neutral mt-1">Organize your products into categories.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-light overflow-hidden">
        <div className="p-4 border-b border-neutral-light bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 text-neutral absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search categories..." 
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
                  <th className="p-4 font-semibold">Image</th>
                  <th className="p-4 font-semibold">Category Name</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map(category => (
                    <tr key={category.id} className="hover:bg-accent-light/50 transition-colors group">
                      <td className="p-4 w-24">
                        <div className="w-16 h-16 rounded-xl bg-neutral-light/50 overflow-hidden border border-neutral-light">
                          {category.image ? (
                            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral"><ImageIcon className="w-6 h-6" /></div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-neutral-dark">{category.name}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          category.status === 'enabled' ? 'bg-green-100 text-green-700' : 'bg-neutral-light text-neutral-dark'
                        }`}>
                          {category.status || 'enabled'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openModal(category)}
                            className="p-2 text-neutral hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(category.id)}
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
                    <td colSpan="4" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Layers className="w-12 h-12 text-neutral-light mb-3" />
                        <p className="text-neutral-dark font-medium text-lg">No categories found.</p>
                        <p className="text-neutral text-sm">Add a new category to get started.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8 overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-neutral-light bg-gray-50/50">
              <h2 className="text-xl font-bold text-neutral-dark">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={closeModal} className="p-2 text-neutral hover:bg-neutral-light hover:text-neutral-dark rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">Category Name *</label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Electronics"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">Status</label>
                  <select 
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">Category Image</label>
                  <input 
                    type="file" accept="image/*"
                    onChange={e => setImageFile(e.target.files[0])}
                    className="w-full border border-neutral-light rounded-xl p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  {editingId && !imageFile && (
                    <p className="text-xs text-neutral mt-2">Leave blank to keep existing image.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-neutral-light">
                <button 
                  type="button" onClick={closeModal}
                  className="px-6 py-2.5 rounded-xl font-medium text-neutral-dark hover:bg-neutral-light border border-neutral-light transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={saving}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                  ) : (
                    'Save Category'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Categories;
