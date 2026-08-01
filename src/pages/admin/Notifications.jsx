import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Bell, Send, Trash2, Gift, AlertTriangle, Zap, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'offer' // offer, festival, flash_sale, maintenance, order
  });

  const fetchNotifications = async () => {
    try {
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setNotifications(list);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      toast.success('Notification sent successfully!');
      setFormData({ title: '', message: '', type: 'offer' });
      fetchNotifications();
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this notification?')) {
      try {
        await deleteDoc(doc(db, 'notifications', id));
        toast.success('Deleted successfully');
        fetchNotifications();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'offer': return <Gift className="w-5 h-5 text-green-500" />;
      case 'flash_sale': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'maintenance': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'order': return <Package className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            Push Notifications
          </h1>
          <p className="text-neutral mt-1">Send alerts, offers, and updates to your customers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compose Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 sticky top-24">
            <h2 className="text-lg font-bold text-neutral-dark mb-4">Compose Message</h2>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Notification Type</label>
                <select 
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                >
                  <option value="offer">Special Offer</option>
                  <option value="festival">Festival Greeting</option>
                  <option value="flash_sale">Flash Sale</option>
                  <option value="order">Order Update</option>
                  <option value="maintenance">System Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Title</label>
                <input 
                  type="text" required
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="e.g. 50% OFF Weekend Sale!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Message</label>
                <textarea 
                  required rows="4"
                  value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Type your message here..."
                />
              </div>
              <button 
                type="submit" disabled={sending}
                className="w-full bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                Send Notification
              </button>
            </form>
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light overflow-hidden">
            <div className="p-6 border-b border-neutral-light bg-gray-50/50">
              <h2 className="text-lg font-bold text-neutral-dark">Sent History</h2>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-neutral-light">
                {notifications.map(notif => (
                  <div key={notif.id} className="p-6 hover:bg-accent-light/30 transition-colors flex items-start gap-4 group">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      notif.type === 'offer' ? 'bg-green-100' :
                      notif.type === 'flash_sale' ? 'bg-amber-100' :
                      notif.type === 'maintenance' ? 'bg-red-100' :
                      'bg-blue-100'
                    }`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-neutral-dark">{notif.title}</h3>
                        <span className="text-xs text-neutral whitespace-nowrap ml-4">
                          {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleString() : 'Just now'}
                        </span>
                      </div>
                      <p className="text-sm text-neutral mt-1">{notif.message}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(notif.id)}
                      className="p-2 text-neutral hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Bell className="w-12 h-12 text-neutral-light mx-auto mb-3" />
                <p className="text-neutral-dark font-medium text-lg">No notifications sent yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Notifications;
