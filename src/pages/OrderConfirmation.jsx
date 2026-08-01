import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

const OrderConfirmation = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  // Protect route from direct access without an order
  if (!orderId) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>
      
      <h1 className="text-4xl font-bold text-neutral-dark mb-4">Order Confirmed!</h1>
      <p className="text-lg text-neutral mb-8 max-w-md">
        Thank you for your purchase. We've received your order and are getting it ready to be shipped.
      </p>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-light max-w-md w-full mb-8">
        <div className="flex items-center justify-between border-b border-neutral-light pb-4 mb-4 text-left">
          <div>
            <p className="text-sm text-neutral">Order Number</p>
            <p className="font-bold text-neutral-dark">#{orderId}</p>
          </div>
          <Package className="w-8 h-8 text-primary" />
        </div>
        
        <div className="text-left space-y-2 text-sm text-neutral-dark">
          <p className="flex justify-between">
            <span>Estimated Delivery:</span>
            <span className="font-medium">3-5 Business Days</span>
          </p>
          <p className="flex justify-between">
            <span>Status:</span>
            <span className="font-medium text-amber-500">Processing</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/profile" 
          className="px-8 py-3 border border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-colors"
        >
          View Order History
        </Link>
        <Link 
          to="/shop" 
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          Continue Shopping <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
