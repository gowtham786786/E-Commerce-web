import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare,
  HelpCircle,
  ExternalLink 
} from 'lucide-react';
import toast from 'react-hot-toast';
import useStoreSettings from '../hooks/useStoreSettings';

const Contact = () => {
  const { currentUser } = useAuth();
  const { settings } = useStoreSettings();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order Status & Tracking',
    orderId: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.displayName || currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please complete all mandatory fields');
      return;
    }

    setLoading(true);

    // Simulate sending message to support desk
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Your message has been received! Ticket #SM-' + Math.floor(10000 + Math.random() * 90000));
      setFormData((prev) => ({ ...prev, message: '', orderId: '' }));
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#5C6B4A]/10 text-[#5C6B4A]">
            <MessageSquare className="w-3.5 h-3.5" /> 24/7 Dedicated Assistance
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight">
            We're Here to Help
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Have a question about an order, delivery, or product? Our support team is ready to assist you every step of the way.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5C6B4A]/10 text-[#5C6B4A] flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-neutral-900 text-sm">Customer Helpline</h3>
            <p className="text-xs text-neutral-500">Direct phone support</p>
            <a href={`tel:${settings.phone || '+916303068154'}`} className="text-sm font-bold text-[#5C6B4A] hover:underline block">
              {settings.phone || '+91 63030 68154'}
            </a>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-neutral-900 text-sm">Email Support</h3>
            <p className="text-xs text-neutral-500">Average response &lt; 2 hrs</p>
            <a href={`mailto:${settings.email || 'reddygowtham397@gmail.com'}`} className="text-sm font-bold text-emerald-700 hover:underline block truncate">
              {settings.email || 'reddygowtham397@gmail.com'}
            </a>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-neutral-900 text-sm">Operational Hours</h3>
            <p className="text-xs text-neutral-500">Monday to Saturday</p>
            <span className="text-xs font-bold text-neutral-900 block">
              9:00 AM – 8:00 PM IST
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-neutral-900 text-sm">Head Office</h3>
            <p className="text-xs text-neutral-500">Fulfillment Center</p>
            <span className="text-xs font-bold text-neutral-900 block">
              {settings.address || 'Hitec City, Hyderabad, India'}
            </span>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          {/* Form Left Side Info */}
          <div className="lg:col-span-2 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C6B4A]">Drop a Message</span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 leading-tight">
              Tell us how we can assist you today.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Whether you need order status updates, product sizing recommendations, or return assistance, fill out the form and an executive will contact you promptly.
            </p>

            <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-neutral-200 space-y-3 text-xs">
              <span className="font-bold text-neutral-900 block">⚡ Looking for immediate answers?</span>
              <ul className="space-y-2 text-neutral-600">
                <li>• Track order status live on the <a href="/track-order" className="text-[#5C6B4A] font-bold underline">Tracking Page</a></li>
                <li>• Read 7-day return guidelines in <a href="/returns-refunds" className="text-[#5C6B4A] font-bold underline">Returns & Refunds</a></li>
                <li>• View your purchase invoices in <a href="/profile?tab=orders" className="text-[#5C6B4A] font-bold underline">Your Orders</a></li>
              </ul>
            </div>
          </div>

          {/* Form Right Side */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-emerald-900">Message Received Successfully!</h3>
                <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. We have created a priority support ticket for you. An agent will respond to your registered email within 2-4 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gowtham Reddy"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold bg-white focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold bg-white focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Mobile Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold bg-white focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Order ID (If Applicable)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. #10492 or UUID"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold bg-white focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                    Subject / Department *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold bg-white focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A]"
                  >
                    <option value="Order Status & Tracking">Order Status & Tracking</option>
                    <option value="Return or Exchange Request">Return or Exchange Request</option>
                    <option value="Payment or Refund Issue">Payment or Refund Issue</option>
                    <option value="Product Details & Compatibility">Product Details & Compatibility</option>
                    <option value="Feedback or Business Inquiry">Feedback or Business Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Please describe your query in detail so we can resolve it faster..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold bg-white focus:outline-none focus:border-[#5C6B4A] focus:ring-1 focus:ring-[#5C6B4A]"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 bg-[#5C6B4A] hover:bg-[#48543a] text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Submitting...' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;
