import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Add or update an item
      addItem: (product) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product.id);
          let newItems;
          if (existingItem) {
            newItems = state.items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            );
          } else {
            newItems = [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                image: product.images?.[0] || '',
                price: product.price,
                quantity: product.quantity || 1,
              },
            ];
          }
          return { items: newItems };
        });
        
        // We sync externally or via a listener in the component tree
      },

      // Remove an item
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      // Update quantity directly
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },

      // Clear cart
      clearCart: () => set({ items: [] }),

      // Sync from Firestore (call this when user logs in)
      syncFromFirestore: async (userId) => {
        if (!userId) return;
        try {
          const cartRef = doc(db, 'users', userId, 'cart', 'current');
          const snap = await getDoc(cartRef);
          
          if (snap.exists()) {
            const firestoreItems = snap.data().items || [];
            
            // Merge strategy: Local storage takes precedence or we merge them.
            // For simplicity in this demo, let's just merge by product ID
            set((state) => {
              const localItems = [...state.items];
              const mergedMap = new Map();
              
              // Add firestore items first
              firestoreItems.forEach(item => {
                mergedMap.set(item.productId, item);
              });
              
              // Override/add local items
              localItems.forEach(item => {
                const existing = mergedMap.get(item.productId);
                if (existing) {
                  mergedMap.set(item.productId, { ...existing, quantity: existing.quantity + item.quantity });
                } else {
                  mergedMap.set(item.productId, item);
                }
              });

              return { items: Array.from(mergedMap.values()) };
            });
            
            // Sync back the merged cart
            await get().syncToFirestore(userId);
          } else {
            // No firestore cart, push local cart
            await get().syncToFirestore(userId);
          }
        } catch (error) {
          console.error("Error syncing cart from Firestore:", error);
        }
      },

      // Sync to Firestore (call this when cart changes and user is logged in)
      syncToFirestore: async (userId) => {
        if (!userId) return;
        try {
          const cartRef = doc(db, 'users', userId, 'cart', 'current');
          await setDoc(cartRef, {
            items: get().items,
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error("Error syncing cart to Firestore:", error);
        }
      },

      // Computed properties
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getTotalCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'shopmate-cart-storage', // unique name
      // Only persist items
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;
