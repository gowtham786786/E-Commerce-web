import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabase';
import { Star, Search, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*, products(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (error) throw error;
        toast.success('Review deleted');
        setReviews(reviews.filter(r => r.id !== id));
      } catch (error) {
        console.error("Error deleting review:", error);
        toast.error('Failed to delete review');
      }
    }
  };

  const filteredReviews = reviews.filter(r => {
    const comment = (r.comment || '').toLowerCase();
    const user = (r.user_name || r.userName || '').toLowerCase();
    const prod = (r.products?.name || r.product_name || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return comment.includes(query) || user.includes(query) || prod.includes(query);
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
                  <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                  <th className="p-4 font-semibold whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map(review => (
                    <tr key={review.id} className="hover:bg-accent-light/50 transition-colors group">
                      <td className="p-4">
                        <p className="text-sm font-bold text-neutral-dark">{review.user_name || review.userName || 'Customer'}</p>
                        <p className="text-xs text-primary font-medium mt-1">On: {review.products?.name || review.product_name || 'Product'}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < (review.rating || 5) ? 'fill-current' : 'text-neutral-light'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-neutral-dark max-w-md">
                        <p className="line-clamp-2">{review.comment || 'No comment provided.'}</p>
                      </td>
                      <td className="p-4 text-sm text-neutral whitespace-nowrap">
                        {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDelete(review.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Review"
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
