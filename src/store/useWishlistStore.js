import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../supabase/supabase';
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
                  image: product.images?.[0] || product.thumbnail || '',
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

      // Sync from Supabase (call on login)
      syncFromSupabase: async (userId) => {
        if (!userId) return;
        try {
          const { data, error } = await supabase
            .from('wishlist_items')
            .select('items')
            .eq('user_id', userId)
            .single();

          if (data && data.items) {
            const remoteItems = data.items || [];
            set((state) => {
              const localItems = [...state.items];
              const mergedMap = new Map();

              remoteItems.forEach(item => mergedMap.set(item.productId, item));
              localItems.forEach(item => mergedMap.set(item.productId, item));

              return { items: Array.from(mergedMap.values()) };
            });

            await get().syncToSupabase(userId);
          } else {
            await get().syncToSupabase(userId);
          }
        } catch (error) {
          console.error("Error syncing wishlist from Supabase:", error);
        }
      },

      // Sync to Supabase
      syncToSupabase: async (userId) => {
        if (!userId) return;
        try {
          await supabase
            .from('wishlist_items')
            .upsert(
              {
                user_id: userId,
                items: get().items,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            );
        } catch (error) {
          console.error("Error syncing wishlist to Supabase:", error);
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
