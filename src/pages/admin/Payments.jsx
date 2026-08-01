import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { formatCurrency, convertUsdToInr } from '../../utils/formatCurrency';
import { CreditCard, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayments = async () => {
    try {
      // In a real app, you might have a dedicated 'payments' collection.
      // Here, assuming payment info is tied to 'orders'.
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const paymentList = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Construct a mock transaction ID if none exists
        paymentList.push({ 
          id: data.transactionId || `TXN${doc.id.slice(0,8).toUpperCase()}`, 
          orderId: doc.id,
          ...data 
        });
      });
      setPayments(paymentList);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <CreditCard className="w-8 h-8 text-primary" />
            Payments
          </h1>
          <p className="text-neutral mt-1">View transaction history and payment statuses.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-light overflow-hidden">
        <div className="p-4 border-b border-neutral-light bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 text-neutral absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Transaction ID, Order ID, or Customer..." 
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
                  <th className="p-4 font-semibold whitespace-nowrap">Transaction ID</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Order ID</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Customer</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Amount</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Method</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="p-4 font-semibold whitespace-nowrap text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-accent-light/50 transition-colors">
                      <td className="p-4 text-sm font-medium text-neutral-dark">{payment.id}</td>
                      <td className="p-4 text-sm text-primary hover:underline cursor-pointer">
                        #{payment.orderId.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-4 text-sm text-neutral-dark">{payment.customer?.name || 'Guest'}</td>
                      <td className="p-4 text-sm font-bold text-neutral-dark">
                        {formatCurrency(convertUsdToInr(payment.total))}
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-medium bg-neutral-light px-2 py-1 rounded-md uppercase tracking-wider text-neutral-dark">
                          {payment.paymentMethod || 'COD'}
                        </span>
                      </td>
                      <td className="p-4">
                         <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          payment.paymentStatus === 'completed' || (payment.paymentMethod === 'cod' && payment.status === 'delivered') ? 'bg-green-100 text-green-700' : 
                          payment.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {payment.paymentStatus || (payment.paymentMethod === 'cod' ? (payment.status === 'delivered' ? 'Completed (COD)' : 'Pending (COD)') : 'Completed')}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-neutral text-right">
                        {payment.createdAt?.toDate ? payment.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-neutral">No transactions found.</td>
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

export default Payments;
