import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, ShieldAlert, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { hashOtp } from '../../utils/hashOtp';
import { db } from '../../firebase/firebase';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userCredential = await login(email, password);
      
      const userRef = doc(db, 'users', userCredential.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists() && userSnap.data().role === 'admin') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await hashOtp(otp);
        
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        
        await setDoc(doc(db, 'admin_otps', userCredential.uid), {
          code: hashedOtp,
          createdAt: new Date(),
          expiresAt: expiresAt,
          attempts: 0
        });
        
        await updateDoc(userRef, {
          otpVerified: false
        });
        
        // Call backend to send the email
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: email,
              subject: 'ShopMate Admin Verification Code',
              html: `<h2>Admin Verification</h2><p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 5 minutes.</p>`
            })
          });
          if (res.ok) {
            toast.success(`Verification code sent to ${email}`, { duration: 6000 });
            navigate('/admin/verify-otp', { replace: true });
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
      } else {
        await logout();
        toast.error('Access Denied: You do not have admin privileges.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-light p-8 max-w-md w-full">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
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
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
