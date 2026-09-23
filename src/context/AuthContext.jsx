import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/supabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const getAuthErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';
  const msg = error.message || error.error_description || '';
  if (msg.includes('Invalid login credentials')) return 'Invalid email or password.';
  if (msg.includes('User already registered')) return 'An account with this email already exists. Please log in.';
  if (msg.includes('Password should be at least')) return 'Password must be at least 6 characters.';
  if (msg.includes('Email not confirmed')) return 'Please check your email and confirm your account before logging in.';
  return msg || 'Authentication error. Please try again.';
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch and normalize user profile from Supabase
  async function fetchUserProfile(authUser) {
    if (!authUser) return null;
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      const fallbackName =
        authUser.user_metadata?.displayName ||
        authUser.user_metadata?.full_name ||
        (authUser.email ? authUser.email.split('@')[0] : 'User');

      const photoURL =
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.photoURL ||
        profile?.photo_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=E2E8F0&color=1E293B`;

      return {
        id: authUser.id,
        uid: authUser.id, // Backwards compatibility for existing components
        email: authUser.email,
        displayName: profile?.display_name || fallbackName,
        phone: profile?.phone || '',
        photoURL,
        role: profile?.role || 'customer',
        provider: authUser.app_metadata?.provider || 'email',
        ...profile
      };
    } catch (err) {
      console.warn("Could not fetch user profile from Supabase:", err);
      return {
        id: authUser.id,
        uid: authUser.id,
        email: authUser.email,
        displayName: authUser.email ? authUser.email.split('@')[0] : 'User',
        role: 'customer'
      };
    }
  }

  async function signup(email, password, displayName) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            displayName,
            full_name: displayName
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        // Ensure profile row exists
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          display_name: displayName,
          role: 'customer'
        }, { onConflict: 'id' });

        const userObj = await fetchUserProfile(data.user);
        setCurrentUser(userObj);
        return userObj;
      }
      return null;
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }

  async function login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data?.user) {
        const userObj = await fetchUserProfile(data.user);
        setCurrentUser(userObj);
        return userObj;
      }
      return null;
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }

  async function logout() {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  async function loginWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }

  async function signupWithGoogle() {
    return loginWithGoogle();
  }

  async function resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/profile`
      });
      if (error) throw error;
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userObj = await fetchUserProfile(session.user);
        setCurrentUser(userObj);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    }).catch((err) => {
      console.warn("getSession error:", err);
      setCurrentUser(null);
      setLoading(false);
    });

    // 2. Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userObj = await fetchUserProfile(session.user);
        setCurrentUser(userObj);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loginWithGoogle,
    signupWithGoogle,
    resetPassword
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-accent text-neutral-dark">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-neutral font-medium text-sm animate-pulse">Loading ShopMate...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
