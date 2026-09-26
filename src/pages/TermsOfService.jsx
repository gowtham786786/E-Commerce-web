import { Link } from 'react-router-dom';
import { Scale, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[#FBF9F5] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#5C6B4A]/10 text-[#5C6B4A]">
            <Scale className="w-3.5 h-3.5" /> Legal & Terms
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Please read these terms and conditions carefully before using the ShopMate platform and services.
          </p>
          <p className="text-xs text-neutral-400">
            Last Updated: September 2026 • Effective Date: September 24, 2026
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-8 text-neutral-700 leading-relaxed text-sm">
        
        {/* Section 1 */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#5C6B4A]" />
            <span>1. Acceptance of Terms</span>
          </h2>
          <p>
            By accessing or using ShopMate, registering an account, or placing an order, you agree to be bound by these Terms of Service and all applicable laws and regulations of India. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#5C6B4A]" />
            <span>2. Account Responsibilities & Security</span>
          </h2>
          <p>
            When registering an account on ShopMate, you agree to provide truthful, accurate, and current information. You are solely responsible for maintaining the confidentiality of your account credentials, passwords, and for restricting access to your computer and devices.
          </p>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#5C6B4A]" />
            <span>3. Product Pricing & Inventory Accuracy</span>
          </h2>
          <p>
            All prices displayed on ShopMate are denominated in Indian Rupees (₹) and include applicable taxes (GST) unless explicitly noted. While we endeavor to ensure all pricing and catalog details are accurate, technical typographical errors may occasionally occur. In the event an item is listed at an incorrect price, ShopMate reserves the right to cancel affected orders and issue a full immediate refund.
          </p>
        </div>

        {/* Section 4 */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#5C6B4A]" />
            <span>4. Order Cancellations & Refunds</span>
          </h2>
          <p>
            Customers may cancel any order free of charge prior to fulfillment center dispatch. Once an item has been dispatched with courier consignment tracking, orders can be returned or exchanged under our standard 7-day hassle-free return policy as described in our <Link to="/returns-refunds" className="text-[#5C6B4A] font-bold underline">Returns & Refunds</Link> guidelines.
          </p>
        </div>

        {/* Section 5 */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#5C6B4A]" />
            <span>5. Governing Law & Jurisdiction</span>
          </h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with the platform or purchases shall be subject to the exclusive jurisdiction of the competent courts in Hyderabad, Telangana, India.
          </p>
        </div>

      </div>
    </div>
  );
};

export default TermsOfService;
