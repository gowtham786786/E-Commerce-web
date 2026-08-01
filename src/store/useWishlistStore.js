import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import toast from 'react-hot-toast';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Add to wishlist
      addItem: (product) => {
        set((state) => {
          if (!state.items.find(item => item.productId === product.id)) {
            toast.success('Added to wishlist!');
            return {
              items: [
                ...state.items,
                {
                  productId: product.id,
                  name: product.name,
                  image: product.images?.[0] || '',
                  price: product.price,
                  rating: product.rating || 0
                },
              ],
            };
          }
          return state;
        });
      },

      // Remove from wishlist
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
        toast.success('Removed from wishlist');
      },
      
      // Toggle wishlist state
      toggleItem: (product) => {
        const state = get();
        if (state.checkIsWishlisted(product.id || product.productId)) {
          state.removeItem(product.id || product.productId);
        } else {
          state.addItem(product);
        }
      },

      // Check if item is in wishlist
      checkIsWishlisted: (productId) => {
        return get().items.some(item => item.productId === productId);
      },

      // Clear wishlist
      clearWishlist: () => set({ items: [] }),

      // Sync from Firestore (call on login)
      syncFromFirestore: async (userId) => {
        if (!userId) return;
        try {
          const wishlistRef = doc(db, 'users', userId, 'wishlist', 'current');
          const snap = await getDoc(wishlistRef);
          
          if (snap.exists()) {
            const firestoreItems = snap.data().items || [];
            
            // Merge strategy: just take union
            set((state) => {
              const localItems = [...state.items];
              const mergedMap = new Map();
              
              firestoreItems.forEach(item => mergedMap.set(item.productId, item));
              localItems.forEach(item => mergedMap.set(item.productId, item));

              return { items: Array.from(mergedMap.values()) };
            });
            
            await get().syncToFirestore(userId);
          } else {
            await get().syncToFirestore(userId);
          }
        } catch (error) {
          console.error("Error syncing wishlist from Firestore:", error);
        }
      },

      // Sync to Firestore
      syncToFirestore: async (userId) => {
        if (!userId) return;
        try {
          const wishlistRef = doc(db, 'users', userId, 'wishlist', 'current');
          await setDoc(wishlistRef, {
            items: get().items,
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error("Error syncing wishlist to Firestore:", error);
        }
      }
    }),
    {
      name: 'shopmate-wishlist-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useWishlistStore;
