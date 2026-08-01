import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Tag, Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '', discount: '', expiry: '', usageLimit: '', minimumOrder: '', status: 'enabled'
  });

  const fetchCoupons = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'coupons'));
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setCoupons(list);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingId(coupon.id);
      setFormData({
        code: coupon.code,
        discount: coupon.discount.toString(),
        expiry: coupon.expiry,
        usageLimit: coupon.usageLimit.toString(),
        minimumOrder: coupon.minimumOrder.toString(),
        status: coupon.status || 'enabled'
      });
    } else {
      setEditingId(null);
      setFormData({ code: '', discount: '', expiry: '', usageLimit: '', minimumOrder: '', status: 'enabled' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this coupon?')) {
      try {
        await deleteDoc(doc(db, 'coupons', id));
        toast.success('Deleted successfully');
        fetchCoupons();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        discount: parseFloat(formData.discount),
        expiry: formData.expiry,
        usageLimit: parseInt(formData.usageLimit) || 0,
        minimumOrder: parseFloat(formData.minimumOrder) || 0,
        status: formData.status,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'coupons', editingId), couponData);
        toast.success('Coupon updated!');
      } else {
        couponData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'coupons'), couponData);
        toast.success('Coupon created!');
      }
      
      closeModal();
      fetchCoupons();
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error('Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Tag className="w-8 h-8 text-primary" />
            Coupons
          </h1>
          <p className="text-neutral mt-1">Create and manage discount codes.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-light overflow-hidden">
        <div className="p-4 border-b border-neutral-light bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 text-neutral absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search coupon codes..." 
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
                  <th className="p-4 font-semibold whitespace-nowrap">Code</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Discount</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Min Order</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Usage Limit</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Expiry</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {filteredCoupons.length > 0 ? (
                  filteredCoupons.map(coupon => {
                    const isExpired = new Date(coupon.expiry) < new Date();
                    return (
                      <tr key={coupon.id} className="hover:bg-accent-light/50 transition-colors group">
                        <td className="p-4 font-bold text-primary tracking-wider">{coupon.code}</td>
                        <td className="p-4 text-sm font-bold text-neutral-dark">{coupon.discount}% OFF</td>
                        <td className="p-4 text-sm text-neutral">₹{coupon.minimumOrder}</td>
                        <td className="p-4 text-sm text-neutral">{coupon.usageLimit > 0 ? coupon.usageLimit : 'Unlimited'}</td>
                        <td className="p-4 text-sm text-neutral">
                           {coupon.expiry ? new Date(coupon.expiry).toLocaleDateString() : 'N/A'}
                           {isExpired && <span className="ml-2 text-xs text-red-500 font-bold">(Expired)</span>}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                            coupon.status === 'enabled' && !isExpired ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {isExpired ? 'Expired' : coupon.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openModal(coupon)} className="p-2 text-neutral hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(coupon.id)} className="p-2 text-neutral hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-neutral">No coupons found.</td>
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
              <h2 className="text-xl font-bold text-neutral-dark">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={closeModal} className="p-2 text-neutral hover:bg-neutral-light hover:text-neutral-dark rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">Coupon Code *</label>
                  <input 
                    type="text" required uppercase
                    value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold tracking-wider"
                    placeholder="e.g. SUMMER50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Discount (%) *</label>
                    <input 
                      type="number" required min="1" max="100"
                      value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Min Order (₹)</label>
                    <input 
                      type="number" min="0"
                      value={formData.minimumOrder} onChange={e => setFormData({...formData, minimumOrder: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Usage Limit</label>
                    <input 
                      type="number" min="0" placeholder="0 for unlimited"
                      value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">Expiry Date *</label>
                  <input 
                    type="date" required
                    value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
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
                    'Save Coupon'
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

export default Coupons;
