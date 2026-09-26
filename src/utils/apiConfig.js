/**
 * Intelligent API URL resolver for both local development and Vercel production deployment.
 * Always routes directly to same-origin /api Serverless Functions on Vercel.
 * This completely eliminates the 15-20 second sleep lag of free external backends (like Render)
 * and guarantees that real OTP emails are dispatched instantly.
 */
export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // In production (Vercel), always use same-origin /api serverless endpoints
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return cleanEndpoint;
  }

  // Local development: use relative path proxied by Vite or localhost
  return cleanEndpoint;
};
