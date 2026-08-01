import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  getAdditionalUserInfo
} from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/invalid-email': return 'Invalid email address.';
    case 'auth/user-disabled': return 'This user account has been disabled.';
    case 'auth/user-not-found': return 'No account found. Please sign up first.';
    case 'auth/wrong-password': return 'Incorrect password.';
    case 'auth/invalid-credential': return 'Invalid email or password.';
    case 'auth/email-already-in-use': return 'An account with this email already exists. Please log in.';
    case 'auth/popup-closed-by-user': return 'Google login was cancelled.';
    case 'auth/network-request-failed': return 'Network error. Please check your connection.';
    default: return error.message || 'An unexpected error occurred.';
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function createUserProfileDocument(userAuth, additionalData = {}) {
    if (!userAuth) return;

    const userRef = doc(db, 'users', userAuth.uid);
    const snapShot = await getDoc(userRef);

    const { email, displayName, photoURL, phoneNumber } = userAuth;
    const fallbackName = displayName || additionalData.displayName || (email ? email.split('@')[0] : 'User');
    const finalPhotoURL = photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=E2E8F0&color=1E293B`;

    if (!snapShot.exists()) {
      const createdAt = serverTimestamp();
      
      try {
        await setDoc(userRef, {
          uid: userAuth.uid,
          displayName: fallbackName,
          email: email || '',
          phone: phoneNumber || additionalData.phone || '',
          photoURL: finalPhotoURL,
          provider: additionalData.provider || 'email',
          role: 'customer',
          createdAt,
          lastLogin: serverTimestamp(),
          ...additionalData
        });
      } catch (error) {
        console.error('Error creating user', error);
      }
    } else {
      try {
        const existingData = snapShot.data();
        const updates = { lastLogin: serverTimestamp() };
        
        if (additionalData.provider === 'google') {
           if (displayName && existingData.displayName !== displayName) updates.displayName = displayName;
           if (photoURL && existingData.photoURL !== photoURL) updates.photoURL = photoURL;
           if (phoneNumber && existingData.phone !== phoneNumber) updates.phone = phoneNumber;
        }
        
        if (!existingData.displayName && !updates.displayName) updates.displayName = fallbackName;
        if (!existingData.photoURL && !updates.photoURL) updates.photoURL = finalPhotoURL;
        
        await updateDoc(userRef, updates);
      } catch (error) {
        console.error('Error updating existing user data', error);
      }
    }
    return userRef;
  }

  async function signup(email, password, displayName) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfileDocument(user, { displayName, provider: 'password' });
      return user;
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }

  async function login(email, password) {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await createUserProfileDocument(user, { provider: 'password' });
      return user;
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }

  function logout() {
    return signOut(auth);
  }

  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      
      const additionalInfo = getAdditionalUserInfo(result);
      if (additionalInfo.isNewUser) {
        await result.user.delete();
        await signOut(auth);
        throw new Error('No account found. Please sign up first.');
      }

      await createUserProfileDocument(result.user, { provider: 'google' });
      return result.user;
    } catch (error) {
      if (error.message === 'No account found. Please sign up first.') {
        throw error;
      }
      throw new Error(getAuthErrorMessage(error));
    }
  }

  async function signupWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      await createUserProfileDocument(result.user, { provider: 'google' });
      return result.user;
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }

  async function resetPassword(email) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        if (userDoc.provider === 'google') {
          throw new Error('This account uses Google Sign-In. Please continue with Google.');
        }
      }
      
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      if (error.message === 'This account uses Google Sign-In. Please continue with Google.') {
        throw error;
      }
      throw new Error(getAuthErrorMessage(error));
    }
  }

  useEffect(() => {
    let unsubscribeSnapshot = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setCurrentUser({ uid: user.uid, ...docSnap.data() });
          } else {
            setCurrentUser(user);
          }
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
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

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
