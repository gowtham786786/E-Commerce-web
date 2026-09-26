import { Link } from 'react-router-dom';
import { 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  Banknote 
} from 'lucide-react';

const ReturnsRefunds = () => {
  return (
    <div className="min-h-screen bg-[#FBF9F5] pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-neutral-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#5C6B4A]/10 text-[#5C6B4A]">
            <RotateCcw className="w-3.5 h-3.5" /> 100% Hassle-Free Guarantee
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight">
            Returns & Refund Policy
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            We want you to love everything you order. If an item isn’t quite right, our straightforward 7-day return policy ensures you get a quick replacement or full refund.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        
        {/* 3 Step Return Process */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-black text-neutral-900 mb-2">How It Works in 3 Easy Steps</h2>
            <p className="text-xs sm:text-sm text-neutral-500">Initiate your return anytime within 7 days of delivery</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#5C6B4A] text-white flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="font-extrabold text-neutral-900 text-base">Request Return Online</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Log into your account, visit <strong>Your Orders</strong>, choose the item, and select your reason for return or exchange.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#5C6B4A] text-white flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="font-extrabold text-neutral-900 text-base">Free Doorstep Pickup</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Our courier executive will arrive at your address within 24–48 hours to inspect and pick up the item. No printing needed!
              </p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#5C6B4A] text-white flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="font-extrabold text-neutral-900 text-base">Instant Refund</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Upon pickup verification, your refund is triggered automatically to your original payment method or bank UPI.
              </p>
            </div>
          </div>
        </div>

        {/* Refund Timeline Table */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#5C6B4A]" />
            <span>Refund Processing Timelines</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Refund Mode</th>
                  <th className="py-3 px-4">Estimated Processing Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="py-4 px-4 font-bold text-neutral-900 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-600" /> UPI (GPay, PhonePe, Paytm)
                  </td>
                  <td className="py-4 px-4 text-neutral-600">Original UPI VPA / Account</td>
                  <td className="py-4 px-4 font-bold text-emerald-700">24 to 48 Hours</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-neutral-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" /> Credit / Debit Cards
                  </td>
                  <td className="py-4 px-4 text-neutral-600">Original Issuing Bank Card</td>
                  <td className="py-4 px-4 font-bold text-blue-700">3 to 5 Business Days</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-neutral-900 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-600" /> Cash on Delivery (COD)
                  </td>
                  <td className="py-4 px-4 text-neutral-600">Direct Bank Transfer (NEFT/UPI)</td>
                  <td className="py-4 px-4 font-bold text-amber-700">Within 24 Hours of Pickup</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Eligibility & Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-neutral-900 text-lg flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Returnable Items
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                <span>Items with genuine manufacturing defects or physical transit damage.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                <span>Wrong item, color, or variant received compared to order invoice.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                <span>Clothing and footwear that do not fit (must retain brand tags).</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-neutral-900 text-lg flex items-center gap-2 text-rose-700">
              <ShieldCheck className="w-5 h-5 text-rose-600" /> Non-Returnable Items
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-2 shrink-0" />
                <span>Personal hygiene products, perfumes, and opened beauty cosmetics.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-2 shrink-0" />
                <span>Items returned without original manufacturer barcode box or tags.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-2 shrink-0" />
                <span>Products showing visible signs of wear, liquid spills, or alterations.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#FAF8F5] rounded-3xl p-8 border border-neutral-200 text-center space-y-4">
          <h3 className="text-xl font-black text-neutral-900">Need Help with an Existing Order?</h3>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            Our customer support specialists are available 7 days a week to guide you through any return or exchange.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/profile?tab=orders"
              className="px-6 py-2.5 bg-[#5C6B4A] hover:bg-[#48543a] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md"
            >
              View Your Orders
            </Link>
            <Link
              to="/contact"
              className="px-6 py-2.5 bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-50 rounded-xl font-bold text-xs sm:text-sm transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReturnsRefunds;
