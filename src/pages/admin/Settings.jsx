import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    websiteName: 'ShopMate',
    email: 'support@shopmate.com',
    phone: '',
    address: '',
    gstNumber: '',
    taxRate: '18',
    deliveryCharge: '50',
    currency: 'INR',
    facebook: '',
    instagram: '',
    twitter: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'general'));
        if (docSnap.exists()) {
          setSettings({ ...settings, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-12"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            Store Settings
          </h1>
          <p className="text-neutral mt-1">Configure your global store preferences and information.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        {/* General Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 md:p-8">
          <h2 className="text-xl font-bold text-neutral-dark mb-6 border-b border-neutral-light pb-4">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Website Name</label>
              <input 
                type="text" name="websiteName" required value={settings.websiteName} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Contact Email</label>
              <input 
                type="email" name="email" required value={settings.email} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Phone Number</label>
              <input 
                type="text" name="phone" value={settings.phone} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">GST Number</label>
              <input 
                type="text" name="gstNumber" value={settings.gstNumber} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-dark mb-1">Store Address</label>
              <textarea 
                name="address" rows="3" value={settings.address} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          </div>
        </div>

        {/* E-Commerce Config */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 md:p-8">
          <h2 className="text-xl font-bold text-neutral-dark mb-6 border-b border-neutral-light pb-4">Financial & Shipping</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Currency Code</label>
              <input 
                type="text" name="currency" value={settings.currency} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="e.g. INR"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Default Tax Rate (%)</label>
              <input 
                type="number" name="taxRate" value={settings.taxRate} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Flat Delivery Charge (₹)</label>
              <input 
                type="number" name="deliveryCharge" value={settings.deliveryCharge} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 md:p-8">
          <h2 className="text-xl font-bold text-neutral-dark mb-6 border-b border-neutral-light pb-4">Social Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Facebook URL</label>
              <input 
                type="url" name="facebook" value={settings.facebook} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Instagram URL</label>
              <input 
                type="url" name="instagram" value={settings.instagram} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Twitter URL</label>
              <input 
                type="url" name="twitter" value={settings.twitter} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" disabled={saving}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-primary/20 disabled:opacity-70 text-lg"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            Save Settings
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Settings;
