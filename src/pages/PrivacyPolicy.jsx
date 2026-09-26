import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#FBF9F5] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#5C6B4A]/10 text-[#5C6B4A]">
            <ShieldCheck className="w-3.5 h-3.5" /> Data Security & Transparency
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Your privacy is foundational to our relationship. Learn how ShopMate collects, protects, and handles your personal information.
          </p>
          <p className="text-xs text-neutral-400">
            Last Updated: September 2026 • Effective Immediately
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-8 text-neutral-700 leading-relaxed text-sm">
        
        {/* Section 1 */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#5C6B4A]" />
            <span>1. Information We Collect</span>
          </h2>
          <p>
            When you browse, register, or make a purchase on ShopMate, we collect specific information necessary to provide seamless e-commerce services:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-neutral-600">
            <li><strong>Account & Contact Data:</strong> Name, email address, mobile phone number, and delivery addresses.</li>
            <li><strong>Transactional Records:</strong> Order histories, item preferences, invoice records, and delivery tracking signatures.</li>
            <li><strong>Technical & Usage Metrics:</strong> Device specifications, IP addresses, browser types, and session cookies to personalize your shopping experience.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#5C6B4A]" />
            <span>2. How We Utilize Your Information</span>
          </h2>
          <p>
            We process your personal data strictly for legitimate operational purposes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-neutral-600">
            <li>Dispatching, routing, and delivering orders to your chosen delivery address via verified courier partners.</li>
            <li>Sending SMS and WhatsApp delivery milestone notifications, OTP authentications, and order receipts.</li>
            <li>Processing returns, replacements, and issuing immediate refunds to your original payment instruments.</li>
            <li>Detecting fraud, unauthorized account logins, and safeguarding platform integrity.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#5C6B4A]" />
            <span>3. Zero Sale of Personal Data</span>
          </h2>
          <p>
            <strong>ShopMate never sells, rents, or monetizes your personal information to third-party advertisers or data brokers.</strong>
          </p>
          <p className="text-xs sm:text-sm text-neutral-600">
            Information is shared solely with certified logistical partners (e.g. BlueDart, Delhivery) strictly to fulfill order deliveries, and with secure PCI-DSS certified payment processors to execute authorized transactions.
          </p>
        </div>

        {/* Section 4 */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#5C6B4A]" />
            <span>4. Your Data Rights & Account Control</span>
          </h2>
          <p>
            You retain absolute ownership over your profile information:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-neutral-600">
            <li>You can review, edit, or delete saved delivery addresses at any time in your <Link to="/profile" className="text-[#5C6B4A] font-bold underline">Profile Dashboard</Link>.</li>
            <li>You may request complete account data deletion by contacting our privacy compliance team.</li>
            <li>You can opt out of promotional newsletters with a single click at the bottom of any marketing email.</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
