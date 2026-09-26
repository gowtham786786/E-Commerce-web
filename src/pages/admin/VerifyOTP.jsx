import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, RefreshCw, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { hashOtp } from '../../utils/hashOtp';
import { maskEmail } from '../../utils/maskEmail';
import { getApiUrl } from '../../utils/apiConfig';
import { motion } from 'framer-motion';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const adminEmail = currentUser?.email || sessionStorage.getItem('admin_otp_email') || 'Admin';

  useEffect(() => {
    // If not authenticated or not an admin, redirect back to login
    if (!currentUser && !sessionStorage.getItem('admin_otp_hash')) {
      navigate('/admin/login', { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [resendDisabled, countdown]);

  const handleChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = cleaned ? cleaned.slice(-1) : '';
    setOtp(newOtp);

    // Auto focus next input
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (pastedData.length === 0) return;

    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    const targetIndex = Math.min(pastedData.length, 5);
    inputRefs.current[targetIndex]?.focus();
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      return toast.error('Please enter all 6 digits of the verification code');
    }

    setLoading(true);
    try {
      const storedHash = sessionStorage.getItem('admin_otp_hash');
      const expiresAt = Number(sessionStorage.getItem('admin_otp_expires') || 0);
      const attempts = Number(sessionStorage.getItem('admin_otp_attempts') || 0);

      if (!storedHash) {
        toast.error('No pending OTP request found. Please request a new one.');
        setLoading(false);
        return;
      }

      // Check expiry (5 mins)
      if (Date.now() > expiresAt) {
        toast.error('Verification code has expired. Please request a new code.');
        setLoading(false);
        return;
      }

      // Check max attempts
      if (attempts >= 5) {
        toast.error('Too many failed attempts. Please request a new verification code.');
        setLoading(false);
        return;
      }

      const inputHash = await hashOtp(otpCode);

      if (inputHash === storedHash) {
        // Success: Mark admin OTP verified in sessionStorage
        sessionStorage.setItem('admin_otp_verified', 'true');
        sessionStorage.removeItem('admin_otp_hash');
        sessionStorage.removeItem('admin_otp_expires');
        sessionStorage.removeItem('admin_otp_attempts');

        toast.success('Two-factor verification successful! Welcome back.');
        navigate('/admin', { replace: true });
      } else {
        // Failed attempt
        const newAttempts = attempts + 1;
        sessionStorage.setItem('admin_otp_attempts', String(newAttempts));
        toast.error(`Invalid verification code. (${5 - newAttempts} attempts remaining)`);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const newHash = await hashOtp(newOtp);
      const expiresAt = Date.now() + 5 * 60 * 1000;

      sessionStorage.setItem('admin_otp_hash', newHash);
      sessionStorage.setItem('admin_otp_expires', String(expiresAt));
      sessionStorage.setItem('admin_otp_attempts', '0');

      // Dispatch to backend email service / Vercel serverless function
      try {
        const res = await fetch(getApiUrl('/api/email/send'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: adminEmail,
            otp: newOtp
          })
        });
        const resData = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error('Email resend error:', resData);
        }
      } catch (err) {
        console.warn('Backend email notification notice:', err.message);
      }

      // Display confirmation toast
      toast.success(`New verification code sent to ${maskEmail(adminEmail)}!`, { duration: 6000 });

      setOtp(['', '', '', '', '', '']);
      setResendDisabled(true);
      setCountdown(30);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Resend error:", error);
      toast.error('Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = async () => {
    sessionStorage.removeItem('admin_otp_verified');
    sessionStorage.removeItem('admin_otp_hash');
    sessionStorage.removeItem('admin_otp_expires');
    sessionStorage.removeItem('admin_otp_attempts');
    if (logout) await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-neutral-light/50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl shadow-xl border border-neutral-light p-8 max-w-md w-full relative"
      >
        <button 
          onClick={handleBackToLogin}
          className="absolute top-6 left-6 text-neutral hover:text-primary transition-colors flex items-center gap-1.5 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-6">
          <ShieldCheck className="w-9 h-9 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-neutral-dark text-center mb-2">Two-Factor Authentication</h1>
        <p className="text-neutral text-center mb-8 text-sm px-2">
          We have generated a 6-digit security code for <br />
          <span className="font-semibold text-neutral-dark tracking-wide">{maskEmail(adminEmail)}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className="w-11 h-14 sm:w-14 sm:h-16 text-center text-2xl font-extrabold rounded-2xl border-2 border-neutral-light focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-neutral-dark bg-gray-50 focus:bg-white"
                required
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 px-6 rounded-2xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-5 h-5" />
                Verify & Enter Portal
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-4 border-t border-neutral-light/60">
          <p className="text-sm text-neutral mb-2">Didn't receive the code or need a new one?</p>
          <button
            onClick={handleResend}
            disabled={resendDisabled || loading}
            className="text-primary hover:text-primary-dark font-semibold text-sm flex items-center justify-center gap-1.5 mx-auto disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {resendDisabled ? `Resend code in ${countdown}s` : 'Resend Code'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
