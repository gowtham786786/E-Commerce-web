import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { formatCurrency, convertUsdToInr } from '../../utils/formatCurrency';
import { ShoppingCart, Search, Filter, Eye, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';

const STATUS_OPTIONS = [
  'pending', 'confirmed', 'packed', 'shipped', 
  'out for delivery', 'delivered', 'cancelled', 
  'refund requested', 'refunded'
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const orderList = [];
      snapshot.forEach(doc => orderList.push({ id: doc.id, ...doc.data() }));
      setOrders(orderList.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': case 'refunded': return 'bg-red-100 text-red-700';
      case 'shipped': case 'out for delivery': return 'bg-blue-100 text-blue-700';
      case 'packed': case 'confirmed': return 'bg-purple-100 text-purple-700';
      default: return 'bg-amber-100 text-amber-700';
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
            <ShoppingCart className="w-8 h-8 text-primary" />
            Orders
          </h1>
          <p className="text-neutral mt-1">Manage and track customer orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-light overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-light flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-5 h-5 text-neutral absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-light rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-5 h-5 text-neutral" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto border border-neutral-light rounded-xl px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white capitalize"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
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
                  <th className="p-4 font-semibold whitespace-nowrap">Order ID</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Customer</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Amount</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Payment</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-accent-light/50 transition-colors group">
                      <td className="p-4 text-sm font-medium text-primary">#{order.id.slice(-6).toUpperCase()}</td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-neutral-dark">{order.customer?.name || 'Guest'}</p>
                        <p className="text-xs text-neutral">{order.customer?.email || 'N/A'}</p>
                      </td>
                      <td className="p-4 text-sm text-neutral">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-sm font-bold text-neutral-dark">
                        {formatCurrency(convertUsdToInr(order.total))}
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-medium bg-neutral-light px-2 py-1 rounded-md uppercase tracking-wider text-neutral-dark">
                          {order.paymentMethod || 'COD'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="relative inline-block w-40">
                          <select
                            value={order.status || 'pending'}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                            className={`w-full appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold capitalize outline-none cursor-pointer border-2 border-transparent focus:border-primary/50 transition-colors ${getStatusColor(order.status)} ${updatingId === order.id ? 'opacity-50' : ''}`}
                          >
                            {STATUS_OPTIONS.map(status => (
                              <option key={status} value={status} className="bg-white text-neutral-dark">{status}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-neutral hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <ShoppingCart className="w-12 h-12 text-neutral-light mb-3" />
                        <p className="text-neutral-dark font-medium text-lg">No orders found.</p>
                        <p className="text-neutral text-sm">Try adjusting your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderDetailsModal 
        order={selectedOrder} 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
    </motion.div>
  );
};

export default Orders;
