import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabase';
import { formatCurrency, convertUsdToInr } from '../../utils/formatCurrency';
import { Users, Search, Ban, CheckCircle, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Filter out admins from customer list
      const customerList = (data || []).filter(c => c.role !== 'admin');
      setCustomers(customerList);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleBlock = async (id, currentRole) => {
    try {
      const isBlocked = currentRole === 'blocked';
      const newRole = isBlocked ? 'user' : 'blocked';
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', id);

      if (error) throw error;
      toast.success(`User ${newRole === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
      setCustomers(customers.map(c => c.id === id ? { ...c, role: newRole } : c));
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Customer deleted successfully');
        setCustomers(customers.filter(c => c.id !== id));
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error('Failed to delete customer');
      }
    }
  };

  const filteredCustomers = customers.filter(c => {
    const name = (c.display_name || c.displayName || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = c.phone || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query) || phone.includes(query);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Customers
          </h1>
          <p className="text-neutral mt-1">Manage your customer base and user accounts.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-light overflow-hidden">
        <div className="p-4 border-b border-neutral-light bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 text-neutral absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
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
                  <th className="p-4 font-semibold whitespace-nowrap">Customer</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Contact Info</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Joined Date</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Total Spent</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(customer => {
                    const isBlocked = customer.role === 'blocked';
                    const displayName = customer.display_name || customer.displayName || 'Customer';
                    const photo = customer.photo_url || customer.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;
                    const joinDate = customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A';

                    return (
                      <tr key={customer.id} className="hover:bg-accent-light/50 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={photo} 
                              alt={displayName} 
                              className="w-10 h-10 rounded-full object-cover border border-neutral-light shrink-0"
                            />
                            <div>
                              <p className="text-sm font-medium text-neutral-dark">{displayName}</p>
                              <p className="text-xs text-neutral capitalize">{customer.provider || 'Email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-neutral-dark">{customer.email || 'N/A'}</p>
                          <p className="text-xs text-neutral">{customer.phone || 'No phone'}</p>
                        </td>
                        <td className="p-4 text-sm text-neutral">
                          {joinDate}
                        </td>
                        <td className="p-4 text-sm font-bold text-neutral-dark">
                          {formatCurrency(convertUsdToInr(customer.totalSpent || customer.total_spent || 0))}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                            isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-neutral hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Profile">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleToggleBlock(customer.id, customer.role)}
                              className={`p-2 rounded-lg transition-colors ${
                                isBlocked 
                                  ? 'text-green-600 hover:bg-green-50' 
                                  : 'text-amber-600 hover:bg-amber-50'
                              }`}
                              title={isBlocked ? "Unblock User" : "Block User"}
                            >
                              {isBlocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => handleDelete(customer.id)}
                              className="p-2 text-neutral hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text-neutral-light mb-3" />
                        <p className="text-neutral-dark font-medium text-lg">No customers found.</p>
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

export default Customers;
