/**
 * Intelligent API URL resolver for both local development and Vercel production deployment.
 * Prevents mixed-content errors and ensures Vercel Serverless Functions execute on the same origin.
 */
export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const envUrl = import.meta.env.VITE_API_URL;

  // When deployed to production (e.g., Vercel), route through same origin /api
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return `${envUrl.replace(/\/$/, '')}${cleanEndpoint}`;
    }
    return cleanEndpoint;
  }

  // Localhost development: use Vite proxy or configured VITE_API_URL
  if (envUrl) {
    return `${envUrl.replace(/\/$/, '')}${cleanEndpoint}`;
  }
  return cleanEndpoint;
};
