import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../supabase/supabase';

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
                ? { 
                    ...item, 
                    quantity: item.quantity + (product.quantity || 1),
                    price: product.price,
                    gst: product.gst !== undefined ? product.gst : item.gst 
                  }
                : item
            );
          } else {
            newItems = [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                image: product.images?.[0] || product.thumbnail || '',
                price: product.price,
                quantity: product.quantity || 1,
                gst: product.gst !== undefined ? product.gst : null,
              },
            ];
          }
          return { items: newItems };
        });
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

      // Sync from Supabase (call this when user logs in)
      syncFromSupabase: async (userId) => {
        if (!userId) return;
        try {
          const { data, error } = await supabase
            .from('cart_items')
            .select('items')
            .eq('user_id', userId)
            .maybeSingle();

          if (data && data.items) {
            const remoteItems = data.items || [];
            set((state) => {
              const localItems = [...state.items];
              const mergedMap = new Map();

              remoteItems.forEach((item) => mergedMap.set(item.productId, item));
              localItems.forEach((item) => {
                const existing = mergedMap.get(item.productId);
                if (existing) {
                  mergedMap.set(item.productId, { ...existing, quantity: existing.quantity + item.quantity });
                } else {
                  mergedMap.set(item.productId, item);
                }
              });

              return { items: Array.from(mergedMap.values()) };
            });

            await get().syncToSupabase(userId);
          } else {
            await get().syncToSupabase(userId);
          }
        } catch (error) {
          console.error("Error syncing cart from Supabase:", error);
        }
      },

      // Sync to Supabase (call this when cart changes and user is logged in)
      syncToSupabase: async (userId) => {
        if (!userId) return;
        try {
          await supabase
            .from('cart_items')
            .upsert(
              {
                user_id: userId,
                items: get().items,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            );
        } catch (error) {
          console.error("Error syncing cart to Supabase:", error);
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
      name: 'shopmate-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;
