import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Star, Search, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReviews = async () => {
    try {
      // If a reviews collection exists, fetch from it. 
      // If embedded in products, would need to map through all products. Assuming dedicated 'reviews' collection.
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const reviewList = [];
      snapshot.forEach(doc => reviewList.push({ id: doc.id, ...doc.data() }));
      setReviews(reviewList);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      // Fallback for demo purposes if collection doesn't exist yet
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { status: newStatus });
      toast.success(`Review ${newStatus}`);
      setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error('Failed to update review status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
        toast.success('Review deleted');
        setReviews(reviews.filter(r => r.id !== id));
      } catch (error) {
        console.error("Error deleting review:", error);
        toast.error('Failed to delete review');
      }
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.productName?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Star className="w-8 h-8 text-primary" />
            Reviews
          </h1>
          <p className="text-neutral mt-1">Manage and moderate customer product reviews.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-light overflow-hidden">
        <div className="p-4 border-b border-neutral-light bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 text-neutral absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search reviews, products, or customers..." 
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
                  <th className="p-4 font-semibold whitespace-nowrap">Customer & Product</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Rating</th>
                  <th className="p-4 font-semibold">Review</th>
                  <th className="p-4 font-semibold whitespace-nowrap text-center">Status</th>
                  <th className="p-4 font-semibold whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map(review => (
                    <tr key={review.id} className="hover:bg-accent-light/50 transition-colors group">
                      <td className="p-4">
                        <p className="text-sm font-bold text-neutral-dark">{review.userName || 'Anonymous'}</p>
                        <p className="text-xs text-primary font-medium mt-1">On: {review.productName || 'Unknown Product'}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-neutral-light'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-neutral-dark max-w-md">
                        <p className="line-clamp-2">{review.comment}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          review.status === 'approved' ? 'bg-green-100 text-green-700' : 
                          review.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {review.status || 'pending'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {review.status !== 'approved' && (
                            <button 
                              onClick={() => handleStatusUpdate(review.id, 'approved')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {review.status !== 'rejected' && (
                            <button 
                              onClick={() => handleStatusUpdate(review.id, 'rejected')}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(review.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                    <td colSpan="5" className="p-12 text-center text-neutral">No reviews found.</td>
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

export default Reviews;
