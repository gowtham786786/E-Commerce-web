import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check, 
  QrCode, 
  ShieldCheck, 
  Smartphone, 
  ExternalLink,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UpiQrModal({
  isOpen,
  onClose,
  amount,
  customerName,
  orderNumber,
  onConfirmPayment,
  loading = false,
}) {
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');

  if (!isOpen) return null;

  const upiId = import.meta.env.VITE_STORE_UPI_ID || '6303068154@ybl';
  const payeeName = import.meta.env.VITE_STORE_UPI_NAME || 'KARRI GOWTHAM VENKATA REDDY';
  const formattedAmount = Number(amount || 0).toFixed(2);

  // Standard NPCI UPI URI Scheme
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(orderNumber || 'ShopMate Order')}&mode=02&purpose=00`;
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(upiString)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMobileUpi = () => {
    window.location.href = upiString;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmPayment({
      utr: utrNumber.trim(),
      upiId,
      amount: formattedAmount,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-900/70 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-100 my-auto"
        >
          {/* Top Brand Bar */}
          <div className="bg-[#5C6B4A] text-white px-5 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg leading-tight flex items-center gap-2">
                  Scan & Pay with UPI
                  <span className="bg-white/20 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                    Instant
                  </span>
                </h3>
                <p className="text-xs text-white/80">PhonePe, Google Pay, Paytm, BHIM & CRED</p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            {/* Amount Banner */}
            <div className="bg-[#5C6B4A]/8 border border-[#5C6B4A]/25 rounded-2xl p-4 text-center">
              <span className="text-xs uppercase font-extrabold text-[#5C6B4A] tracking-wider block">
                Total Amount Payable
              </span>
              <div className="text-3xl sm:text-4xl font-black text-neutral-900 mt-0.5">
                ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-600 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
                <span>Zero extra transaction fees • Direct Bank Transfer</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80">
              <div className="text-center">
                <div className="relative inline-block p-3 bg-white rounded-2xl shadow-sm border border-neutral-200">
                  <img
                    src={dynamicQrUrl}
                    alt="UPI Dynamic Payment QR Code"
                    className="w-56 h-56 sm:w-60 sm:h-60 object-contain rounded-lg"
                    onError={(e) => {
                      e.target.src = '/images/phonepe-qr.png';
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-1 flex justify-center">
                    <span className="bg-white/95 px-2.5 py-0.5 rounded text-[10px] font-bold text-neutral-600 shadow-2xs border border-neutral-200">
                      Scan with PhonePe, GPay, Paytm or any UPI
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-2 font-medium">
                  Pre-fills <strong>₹{formattedAmount}</strong> automatically upon scanning.
                </p>
              </div>

              {/* Supported UPI Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] font-bold text-neutral-700">
                <span className="px-2.5 py-1 bg-white border border-neutral-200 rounded-md shadow-2xs">
                  Google Pay
                </span>
                <span className="px-2.5 py-1 bg-white border border-neutral-200 rounded-md shadow-2xs text-[#5f259f]">
                  PhonePe
                </span>
                <span className="px-2.5 py-1 bg-white border border-neutral-200 rounded-md shadow-2xs text-[#00b9f5]">
                  Paytm
                </span>
                <span className="px-2.5 py-1 bg-white border border-neutral-200 rounded-md shadow-2xs">
                  BHIM
                </span>
                <span className="px-2.5 py-1 bg-white border border-neutral-200 rounded-md shadow-2xs">
                  CRED
                </span>
              </div>
            </div>

            {/* Store UPI ID & Payee Information */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  Payee Account Name:
                </span>
                <span className="font-extrabold text-neutral-900 text-right">
                  {payeeName}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                    UPI ID (VPA):
                  </span>
                  <span className="font-mono font-bold text-neutral-900 text-sm">
                    {upiId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-800 transition-colors shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Fast Action (If opened on mobile device) */}
            <div className="block sm:hidden">
              <button
                type="button"
                onClick={handleOpenMobileUpi}
                className="w-full py-2.5 px-4 bg-[#5f259f] hover:bg-[#4d1e82] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                Tap to Pay with Installed UPI App
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Payment Confirmation Form */}
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  UPI Reference / UTR Number <span className="text-neutral-400 font-normal">(Optional for faster verification)</span>
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 426819284729 or last 4 digits"
                  maxLength={25}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C6B4A]/30 focus:border-[#5C6B4A] transition-all"
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  You can find the 12-digit UTR in your Google Pay / PhonePe payment receipt.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 text-neutral-700 text-sm font-bold hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 py-3 px-4 rounded-xl bg-[#5C6B4A] hover:bg-[#4a563b] text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying & Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>I Have Paid — Confirm Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
