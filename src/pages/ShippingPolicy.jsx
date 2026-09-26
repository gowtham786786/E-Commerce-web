import { Link } from 'react-router-dom';
import { 
  Truck, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Package, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight 
} from 'lucide-react';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-[#FBF9F5] pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-neutral-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#5C6B4A]/10 text-[#5C6B4A]">
            <Truck className="w-3.5 h-3.5" /> Fast & Transparent Delivery
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            We partner with India's leading logistics providers to ensure your orders reach you quickly, safely, and in pristine condition.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        
        {/* Shipping Rates Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C6B4A]">Cart ₹499 & Above</span>
            <h3 className="text-2xl font-black text-emerald-700">FREE Delivery</h3>
            <p className="text-xs text-neutral-500">
              No delivery charges on any domestic order exceeding ₹499. Applied automatically at checkout.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C6B4A]">Standard Orders</span>
            <h3 className="text-2xl font-black text-neutral-900">₹50 Flat Fee</h3>
            <p className="text-xs text-neutral-500">
              For orders below ₹499, a flat nominal handling fee of ₹50 is applied for express transit.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C6B4A]">Fulfillment Time</span>
            <h3 className="text-2xl font-black text-neutral-900">Same-Day Dispatch</h3>
            <p className="text-xs text-neutral-500">
              Orders confirmed before 2:00 PM IST are packaged and handed to courier networks on the same day.
            </p>
          </div>
        </div>

        {/* Delivery Zones and Timelines */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#5C6B4A]" />
            <span>Estimated Delivery Schedules</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">Region / Zone</th>
                  <th className="py-3 px-4">Coverage Areas</th>
                  <th className="py-3 px-4">Typical Transit Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="py-4 px-4 font-bold text-neutral-900">Metro Hubs</td>
                  <td className="py-4 px-4 text-neutral-600">Bengaluru, Hyderabad, Mumbai, Delhi-NCR, Chennai, Kolkata</td>
                  <td className="py-4 px-4 font-bold text-emerald-700">2 to 3 Business Days</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-neutral-900">Tier 2 & Tier 3 Cities</td>
                  <td className="py-4 px-4 text-neutral-600">State capitals and major district commercial centers</td>
                  <td className="py-4 px-4 font-bold text-blue-700">3 to 5 Business Days</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-neutral-900">Rural & Remote Regions</td>
                  <td className="py-4 px-4 text-neutral-600">North-East states, J&K, Island territories & interior taluks</td>
                  <td className="py-4 px-4 font-bold text-amber-700">5 to 7 Business Days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Courier Partners & Inspection Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-neutral-900 text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-[#5C6B4A]" /> Logistics & Courier Partners
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              We work exclusively with certified tier-1 logistics operators including <strong>BlueDart Express, Delhivery, DTDC, and India Post Speed Post</strong>.
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Every parcel is protected inside tamper-evident waterproof packaging with barcoded AWB consignment slips for 100% end-to-end tracing.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-neutral-900 text-lg flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5 text-amber-600" /> Package Inspection upon Delivery
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              If the outer tamper-evident security tape appears cut, torn, or breached, <strong>please refuse the package immediately</strong> and take a quick photo.
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Notify our support team with your Order ID, and we will dispatch an immediate replacement at zero cost.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#5C6B4A] rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black">Want to check your shipment status?</h3>
            <p className="text-white/80 text-xs sm:text-sm">
              Use our live tracking portal with your order number.
            </p>
          </div>
          <Link
            to="/track-order"
            className="px-6 py-3 bg-white text-[#5C6B4A] hover:bg-neutral-100 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 shrink-0"
          >
            <span>Track Order Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ShippingPolicy;
