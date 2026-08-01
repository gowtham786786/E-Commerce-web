import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase';
import { User, Key, Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Profile = () => {
  const { currentUser } = useAuth();
  
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  });
  
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      let photoURL = currentUser.photoURL;

      if (photoFile) {
        const fileRef = ref(storage, `profiles/${currentUser.uid}_${Date.now()}`);
        const snapshot = await uploadBytes(fileRef, photoFile);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      await updateProfile(currentUser, {
        displayName: profileData.displayName,
        photoURL: photoURL
      });

      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: profileData.displayName,
        phone: profileData.phone,
        photoURL: photoURL
      });

      toast.success('Profile updated successfully!');
      // Reload window to update auth context easily (or could rely on context re-render)
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setSavingPassword(true);
    try {
      await updatePassword(currentUser, passwords.newPassword);
      toast.success('Password updated successfully!');
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please log out and log back in to change your password.');
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-12 max-w-5xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-dark flex items-center gap-3">
          <User className="w-8 h-8 text-primary" />
          Admin Profile
        </h1>
        <p className="text-neutral mt-1">Manage your account details and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 text-center">
            <div className="relative inline-block mb-4 group">
              <img 
                src={photoFile ? URL.createObjectURL(photoFile) : (currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || 'A')}`)} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-accent-light"
              />
              <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-primary-dark transition-colors">
                <Camera className="w-4 h-4" />
                <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
              </label>
            </div>
            <h2 className="text-xl font-bold text-neutral-dark">{currentUser?.displayName}</h2>
            <p className="text-neutral text-sm">{currentUser?.email}</p>
            <span className="inline-block mt-3 px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full uppercase tracking-wider">
              Administrator
            </span>
          </div>
        </div>

        {/* Forms */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Edit Profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 md:p-8">
            <h2 className="text-xl font-bold text-neutral-dark mb-6 border-b border-neutral-light pb-4">Personal Information</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">Full Name</label>
                  <input 
                    type="text" required
                    value={profileData.displayName} onChange={e => setProfileData({...profileData, displayName: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">Email Address (Read Only)</label>
                  <input 
                    type="email" disabled value={profileData.email}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-light bg-neutral-light/50 text-neutral-dark cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-dark mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  type="submit" disabled={savingProfile}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {savingProfile ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Update Profile
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 md:p-8">
            <h2 className="text-xl font-bold text-neutral-dark mb-6 border-b border-neutral-light pb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-neutral" /> Change Password
            </h2>
            <form onSubmit={handlePasswordUpdate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">New Password</label>
                  <input 
                    type="password" required minLength="6"
                    value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1">Confirm New Password</label>
                  <input 
                    type="password" required minLength="6"
                    value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  type="submit" disabled={savingPassword}
                  className="bg-neutral-dark hover:bg-black text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {savingPassword ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Key className="w-4 h-4" />}
                  Update Password
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
