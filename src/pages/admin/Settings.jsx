import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { DEFAULT_STORE_SETTINGS, getLocalSettings, saveLocalSettings } from '../../hooks/useStoreSettings';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(getLocalSettings);

  useEffect(() => {
    const init = async () => {
      try {
        const local = getLocalSettings();
        setSettings(local);

        const res = await fetch('/api/settings');
        if (res.ok) {
          const remote = await res.json();
          saveLocalSettings(remote);
          setSettings(remote);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Immediately update localStorage and notify all components/tabs
      saveLocalSettings(settings);

      // 2. Persist to backend
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      toast.success('Store settings & GST rates updated successfully! 🎉');
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
              <label className="block text-sm font-medium text-neutral-dark mb-1">
                Default GST Rate (%)
              </label>
              <input 
                type="number" 
                name="taxRate" 
                min="0"
                max="100"
                step="any"
                required
                value={settings.taxRate} 
                onChange={handleChange}
                placeholder="18"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="text-[11px] text-neutral-500 mt-1">Global GST applied at customer Cart & Checkout</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Flat Delivery Charge (₹)</label>
              <input 
                type="number" 
                name="deliveryCharge" 
                min="0"
                step="any"
                required
                value={settings.deliveryCharge} 
                onChange={handleChange}
                placeholder="50"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="text-[11px] text-neutral-500 mt-1">Free delivery automatically qualifies &gt; ₹499</p>
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
