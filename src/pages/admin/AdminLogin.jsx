import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, ShieldAlert, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { hashOtp } from '../../utils/hashOtp';
import { maskEmail } from '../../utils/maskEmail';
import { getApiUrl } from '../../utils/apiConfig';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userCredential = await login(email, password);
      
      if (userCredential && userCredential.role === 'admin') {
        // Generate secure 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await hashOtp(otp);
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Store challenge in sessionStorage
        sessionStorage.setItem('admin_otp_hash', hashedOtp);
        sessionStorage.setItem('admin_otp_expires', String(expiresAt));
        sessionStorage.setItem('admin_otp_email', email);
        sessionStorage.setItem('admin_otp_attempts', '0');
        sessionStorage.removeItem('admin_otp_verified');

        // Dispatch email notification to backend service / Vercel serverless function
        try {
          const res = await fetch(getApiUrl('/api/email/send'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: email,
              otp: otp
            })
          });
          const resData = await res.json().catch(() => ({}));
          if (!res.ok) {
            console.error('Email service response error:', resData);
          }
        } catch (err) {
          console.warn('Backend email notification notice:', err.message);
        }

        // Display toast confirming email dispatch
        toast.success(`Verification code sent to ${maskEmail(email)}. Please check your inbox.`, { duration: 6000 });

        // Forward to OTP verification page
        navigate('/admin/verify-otp', { replace: true });
      } else {
        await logout();
        toast.error('Access Denied: You do not have admin privileges.');
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-neutral-light p-8 max-w-md w-full">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-dark text-center mb-2">Admin Portal</h1>
        <p className="text-neutral text-center mb-8 text-sm">
          Please sign in with your administrator credentials.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="admin@shopmate.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-neutral-light focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3.5 px-6 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In to Admin
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-neutral-light pt-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-neutral hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
