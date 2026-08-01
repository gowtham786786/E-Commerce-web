import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { hashOtp } from '../../utils/hashOtp';
import { ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
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
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (!isNaN(char) && i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    if (pastedData.length > 0) {
      inputRefs.current[Math.min(pastedData.length - 1, 5)].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return toast.error('Please enter the 6-digit code');

    setLoading(true);
    try {
      const otpRef = doc(db, 'admin_otps', currentUser.uid);
      const otpSnap = await getDoc(otpRef);

      if (!otpSnap.exists()) {
        toast.error('No OTP found. Please request a new one.');
        setLoading(false);
        return;
      }

      const otpData = otpSnap.data();
      
      // Check expiration
      if (new Date() > otpData.expiresAt.toDate()) {
        toast.error('OTP has expired. Please request a new code.');
        setLoading(false);
        return;
      }

      // Check max attempts
      if (otpData.attempts >= 5) {
        toast.error('Too many failed attempts. Please request a new code.');
        setLoading(false);
        return;
      }

      const hashedInput = await hashOtp(otpCode);

      if (hashedInput === otpData.code) {
        // Success
        await deleteDoc(otpRef);
        await updateDoc(doc(db, 'users', currentUser.uid), {
          otpVerified: true
        });
        
        toast.success('Verification successful!');
        navigate('/admin', { replace: true });
      } else {
        // Failure
        await updateDoc(otpRef, { attempts: otpData.attempts + 1 });
        toast.error('Invalid verification code.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0].focus();
      }
    } catch (error) {
      console.error(error);
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await hashOtp(newOtp);
      
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);
      
      await setDoc(doc(db, 'admin_otps', currentUser.uid), {
        code: hashedOtp,
        createdAt: new Date(),
        expiresAt: expiresAt,
        attempts: 0
      });

      // Call backend to send the email
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: currentUser.email,
            subject: 'ShopMate Admin Verification Code',
            html: `<h2>Admin Verification</h2><p>Your verification code is: <strong>${newOtp}</strong></p><p>This code expires in 5 minutes.</p>`
          })
        });
        if (res.ok) {
          toast.success(`New verification code sent to ${currentUser.email}`, { duration: 6000 });
        } else {
          const errorData = await res.json().catch(() => ({}));
          toast.error(errorData.error || 'Failed to send verification email.');
        }
      } catch (err) {
        console.error('Failed to send email', err);
        const errorMessage = err.message === 'Failed to fetch' 
          ? 'Network error. The server might be starting up, please try again.' 
          : 'Failed to connect to email server.';
        toast.error(errorMessage, { duration: 6000 });
      }
      
      setResendDisabled(true);
      setCountdown(30);
    } catch (error) {
      toast.error('Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-light p-8 max-w-md w-full relative">
        <button 
          onClick={handleBackToLogin}
          className="absolute top-6 left-6 text-neutral hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-neutral-dark text-center mb-2">Admin Verification</h1>
        <p className="text-neutral text-center mb-8 text-sm px-4">
          We've sent a 6-digit verification code to <span className="font-medium text-neutral-dark">{currentUser?.email}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                required
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Verify Code'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-neutral mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={resendDisabled || loading}
            className="text-primary hover:text-primary-dark font-medium text-sm flex items-center justify-center gap-1 mx-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {resendDisabled ? `Resend code in ${countdown}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
