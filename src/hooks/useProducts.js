import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// Global cache to prevent refetching 1000 items on every component mount
let cachedProducts = null;
let isFetching = false;
let fetchPromise = null;

export const useProducts = () => {
  const [products, setProducts] = useState(cachedProducts || []);
  const [loading, setLoading] = useState(!cachedProducts);
  const [error, setError] = useState(null);

  const fetchProducts = async (force = false) => {
    if (cachedProducts && !force) {
      setProducts(cachedProducts);
      setLoading(false);
      return;
    }

    if (isFetching && fetchPromise) {
      setLoading(true);
      try {
        const result = await fetchPromise;
        setProducts(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    isFetching = true;

    fetchPromise = (async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Firestore fetch timeout')), 8000); // 8s timeout for 1000 items
        });

        const queryPromise = getDocs(collection(db, "products"));
        const querySnapshot = await Promise.race([queryPromise, timeoutPromise]);

        let finalProducts = [];
        if (!querySnapshot.empty) {
          finalProducts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log(`[useProducts] Fetched ${finalProducts.length} products from Firestore.`);
        } else {
          console.log("[useProducts] Firestore empty.");
        }
        
        cachedProducts = finalProducts;
        return finalProducts;
      } catch (err) {
        console.error("[useProducts] Error fetching products:", err);
        if (err.message === 'Firestore fetch timeout' || err.code === 'permission-denied') {
          cachedProducts = [];
          return [];
        } else {
          throw err;
        }
      } finally {
        isFetching = false;
      }
    })();

    try {
      const result = await fetchPromise;
      setProducts(result);
    } catch (err) {
      setError(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, refetch: () => fetchProducts(true) };
};
