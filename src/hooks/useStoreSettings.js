import { useState, useEffect, useCallback } from 'react';

export const DEFAULT_STORE_SETTINGS = {
  websiteName: 'ShopMate',
  email: 'reddygowtham397@gmail.com',
  phone: '+91 98765 43210',
  address: '123 Tech Park, Bangalore, India',
  gstNumber: '29AAAAA0000A1Z5',
  taxRate: '18',
  deliveryCharge: '50',
  currency: 'INR',
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  twitter: 'https://twitter.com'
};

const STORAGE_KEY = 'shopmate_admin_settings';

export function getLocalSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error reading store settings from localStorage', e);
  }
  return DEFAULT_STORE_SETTINGS;
}

export function saveLocalSettings(newSettings) {
  try {
    const rawTax = newSettings.taxRate ?? newSettings.gstRate ?? newSettings.gst;
    const normalizedTax = rawTax !== undefined && rawTax !== '' ? String(rawTax) : '18';
    
    const merged = { 
      ...DEFAULT_STORE_SETTINGS, 
      ...newSettings,
      taxRate: normalizedTax,
      gstRate: normalizedTax,
      gst: normalizedTax
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    localStorage.setItem('shopmate_settings_timestamp', Date.now().toString());
    window.dispatchEvent(new CustomEvent('shopmate_settings_updated', { detail: merged }));
    return merged;
  } catch (e) {
    console.error('Error saving store settings to localStorage', e);
    return newSettings;
  }
}

export function useStoreSettings() {
  const [settings, setSettings] = useState(getLocalSettings);

  const syncSettings = useCallback(() => {
    setSettings(getLocalSettings());
  }, []);

  useEffect(() => {
    // 1. Initial background sync from backend API
    const fetchRemote = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          saveLocalSettings(data);
          setSettings(data);
        }
      } catch {
        // Backend not reachable, stay with localStorage
      }
    };
    fetchRemote();

    // 2. Listen to custom event and cross-tab storage changes
    const handleCustomUpdate = (e) => {
      if (e.detail) {
        setSettings(e.detail);
      } else {
        syncSettings();
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY || e.key === 'shopmate_settings_timestamp') {
        syncSettings();
      }
    };

    window.addEventListener('shopmate_settings_updated', handleCustomUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('shopmate_settings_updated', handleCustomUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncSettings]);

  const taxRate = parseFloat(settings.taxRate ?? settings.gstRate ?? settings.gst) || 18;
  const deliveryCharge = parseFloat(settings.deliveryCharge) || 50;

  const calculateTax = useCallback(
    (subtotal) => {
      const num = Number(subtotal) || 0;
      return num * (taxRate / 100);
    },
    [taxRate]
  );

  const getEffectiveTaxRate = useCallback(
    () => {
      return taxRate;
    },
    [taxRate]
  );

  const calculateShipping = useCallback(
    (subtotal) => {
      const num = Number(subtotal) || 0;
      return num > 499 || num === 0 ? 0 : deliveryCharge;
    },
    [deliveryCharge]
  );

  return {
    settings,
    taxRate,
    deliveryCharge,
    calculateTax,
    getEffectiveTaxRate,
    calculateShipping,
    refreshSettings: syncSettings
  };
}

export default useStoreSettings;
