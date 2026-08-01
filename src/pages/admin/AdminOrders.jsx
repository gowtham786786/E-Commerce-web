import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { formatCurrency, convertUsdToInr } from '../../utils/formatCurrency';
import { ShoppingCart, Search, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const ordersList = [];
      snapshot.forEach(doc => ordersList.push({ id: doc.id, ...doc.data() }));
      setOrders(ordersList);
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
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      // Optimistically update UI
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (o.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-neutral-dark">Orders</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-light overflow-hidden">
        <div className="p-4 border-b border-neutral-light flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative max-w-md w-full">
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
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
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Items</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-accent-light/50 transition-colors">
                      <td className="p-4 text-sm font-medium text-primary">#{order.id.slice(-6).toUpperCase()}</td>
                      <td className="p-4 text-sm text-neutral-dark">
                        <div>{order.customer?.name || 'Guest'}</div>
                        <div className="text-xs text-neutral">{order.customer?.email}</div>
                      </td>
                      <td className="p-4 text-sm text-neutral">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-sm text-neutral">
                        {order.items?.length || 0} items
                      </td>
                      <td className="p-4 text-sm font-bold">{formatCurrency(convertUsdToInr(order.total))}</td>
                      <td className="p-4 text-right">
                        <select 
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`
                            px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer border border-neutral-light outline-none capitalize
                            ${order.status === 'delivered' ? 'bg-green-50 text-green-700' : 
                              order.status === 'shipped' ? 'bg-blue-50 text-blue-700' : 
                              order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                              'bg-amber-50 text-amber-700'}
                          `}
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status} className="bg-white text-neutral-dark">{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-neutral">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
