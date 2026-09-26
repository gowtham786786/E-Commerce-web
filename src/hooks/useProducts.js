import { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabase';

// Global cache to prevent refetching items on every component mount
let cachedProducts = null;
let isFetching = false;
let fetchPromise = null;

const mapProduct = (p) => ({
  ...p,
  gst: p.gst !== undefined && p.gst !== null && p.gst !== '' ? parseFloat(p.gst) : undefined,
  subCategory: p.sub_category || p.subCategory || '',
  bestSeller: p.best_seller ?? p.bestSeller ?? false,
  reviewCount: p.review_count ?? p.reviewCount ?? 0,
  availabilityStatus: p.availability_status || p.availabilityStatus || 'In Stock',
  images: Array.isArray(p.images) ? p.images : [],
  colors: Array.isArray(p.colors) ? p.colors : [],
  sizes: Array.isArray(p.sizes) ? p.sizes : [],
  tags: Array.isArray(p.tags) ? p.tags : []
});

export const invalidateProductCache = () => {
  cachedProducts = null;
  isFetching = false;
  fetchPromise = null;
  if (typeof window !== 'undefined') {
    localStorage.setItem('shopmate_products_updated', Date.now().toString());
    window.dispatchEvent(new CustomEvent('shopmate_products_updated'));
  }
};

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

    if (isFetching && fetchPromise && !force) {
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
        const { data, error: sbError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (sbError) throw sbError;

        const finalProducts = (data || []).map(mapProduct);
        cachedProducts = finalProducts;
        return finalProducts;
      } catch (err) {
        console.error('[useProducts] Error fetching products from Supabase:', err);
        setError(err);
        return [];
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

    const handleProductsUpdated = () => {
      fetchProducts(true);
    };

    const handleStorage = (e) => {
      if (e.key === 'shopmate_products_updated') {
        fetchProducts(true);
      }
    };

    window.addEventListener('shopmate_products_updated', handleProductsUpdated);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('shopmate_products_updated', handleProductsUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return { products, loading, error, refetch: () => fetchProducts(true) };
};
