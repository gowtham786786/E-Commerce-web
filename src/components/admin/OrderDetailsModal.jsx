import { X, Package, MapPin, CreditCard, Calendar, ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, convertUsdToInr } from '../../utils/formatCurrency';

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-dark/40 backdrop-blur-sm"
        />
        
        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-light bg-gray-50/50">
            <div>
              <h2 className="text-xl font-bold text-neutral-dark">Order #{order.id.slice(-6).toUpperCase()}</h2>
              <p className="text-sm text-neutral mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-neutral hover:bg-neutral-light hover:text-neutral-dark rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Customer Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-neutral-dark flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Customer & Delivery Details
                </h3>
                <div className="bg-accent-light p-4 rounded-xl space-y-2 text-sm text-neutral-dark">
                  <p><span className="font-semibold">Name:</span> {order.customer?.name || 'Guest'}</p>
                  <p><span className="font-semibold">Email:</span> {order.customer?.email || 'N/A'}</p>
                  <p><span className="font-semibold">Phone:</span> {order.customer?.phone || 'N/A'}</p>
                  <div className="pt-2 mt-2 border-t border-neutral-light/50">
                    <p className="font-semibold mb-1">Shipping Address:</p>
                    <p>{order.customer?.address}</p>
                    <p>{order.customer?.city}, {order.customer?.state} {order.customer?.zip}</p>
                  </div>
                </div>
              </div>

              {/* Order Summary Info */}
              <div className="space-y-4">
                <h3 className="font-bold text-neutral-dark flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment & Status
                </h3>
                <div className="bg-accent-light p-4 rounded-xl space-y-3 text-sm text-neutral-dark">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Status:</span>
                    <span className="bg-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-neutral-light">
                      {order.status || 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Payment Method:</span>
                    <span className="uppercase">{order.paymentMethod || 'COD'}</span>
                  </div>
                  <div className="pt-3 mt-2 border-t border-neutral-light/50 flex justify-between items-center">
                    <span className="font-bold text-base">Total Amount:</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(convertUsdToInr(order.total))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Ordered */}
            <div>
              <h3 className="font-bold text-neutral-dark flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-primary" />
                Items Ordered ({order.items?.length || 0})
              </h3>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-neutral-light rounded-xl bg-white hover:border-primary/30 transition-colors">
                    <div className="w-16 h-16 rounded-lg bg-accent-light overflow-hidden flex-shrink-0 relative">
                      {item.image || item.thumbnail || item.images?.[0] ? (
                        <img 
                          src={item.image || item.thumbnail || item.images?.[0]} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-light/50 flex items-center justify-center text-neutral">
                          <ImageOff className="w-6 h-6 opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-neutral-dark text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-neutral mt-1">Qty: <span className="font-medium text-neutral-dark">{item.quantity}</span></p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-neutral-dark text-sm">
                        {formatCurrency(convertUsdToInr(item.price * item.quantity))}
                      </p>
                      <p className="text-xs text-neutral mt-0.5">
                        {formatCurrency(convertUsdToInr(item.price))} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderDetailsModal;
