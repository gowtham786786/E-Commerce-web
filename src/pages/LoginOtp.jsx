import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Key, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginOtp = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      toast.success('OTP sent successfully!');
      setStep(2);
    } catch (err) {
      const errorMessage = err.message === 'Failed to fetch' 
        ? 'Network error. The server might be starting up, please try again in a moment.' 
        : err.message;
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      toast.success('Verified successfully!');
      
      // Note: Since we are using Firebase, if you want this OTP to truly log you in,
      // the backend would need to return a Firebase Custom Token and you would call:
      // await signInWithCustomToken(auth, data.token);
      
      // For now, we will just redirect to home and show success
      // If you are relying on Firebase's currentUser, this standalone approach won't set it.
      
      navigate('/');
    } catch (err) {
      const errorMessage = err.message === 'Failed to fetch' 
        ? 'Network error. The server might be starting up, please try again in a moment.' 
        : err.message;
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-neutral-light/30 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-light w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-neutral-dark">Login with OTP</h2>
          <p className="text-neutral mt-2">
            {step === 1 ? 'Enter your email to receive a one-time code' : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="john@example.com"
                />
                <Mail className="w-5 h-5 text-neutral absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-70 mt-6"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">OTP Code</label>
              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-center tracking-widest text-lg"
                  placeholder="123456"
                  maxLength={6}
                />
                <Key className="w-5 h-5 text-neutral absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-70 mt-6"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-sm text-primary hover:underline"
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm text-neutral hover:text-primary transition-colors">
            Back to standard login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginOtp;
