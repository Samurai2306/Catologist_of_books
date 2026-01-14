// Determine if we're in production (Netlify deployment) or development
const isProduction = import.meta.env.PROD;

// Use proxy in production to avoid Mixed Content issues (HTTPS -> HTTP)
// In development, we can use the direct API URL
const EXTERNAL_API_HOST = '158.160.203.172';

export const API_CONFIG = {
  // REST API - use proxy in production, direct URL in development
  REST_API: isProduction ? '/api' : `http://${EXTERNAL_API_HOST}:8080`,
  // WebSocket connections
  // NOTE: WebSocket cannot be proxied through Netlify Functions.
  // For production, the external server needs to support WSS (WebSocket Secure)
  // or a dedicated WebSocket proxy service is required.
  // Currently disabled in production to prevent Mixed Content errors.
  WS_SOCKET_IO: `ws://${EXTERNAL_API_HOST}:8081`,
  WS_WEBSOCKET: `ws://${EXTERNAL_API_HOST}:8082`,
  // Flag to indicate if WebSocket is available (only works on HTTP sites or with WSS server)
  WS_ENABLED: !isProduction,
  DOCS: isProduction ? '/api-docs' : `http://${EXTERNAL_API_HOST}:8083`,
  // Keep original external URLs for reference (e.g., for image paths)
  EXTERNAL_API_BASE: `http://${EXTERNAL_API_HOST}:8080`,
}

export const API_ENDPOINTS = {
  BOOKS: '/book/',
  BOOK_BY_ID: (id) => `/book/?id=${id}`,
  AUTHORS: '/author/',
  AUTHOR_BY_ID: (id) => `/author/?id=${id}`,
  GENRES: '/genre/',
  GENRE_BY_ID: (id) => `/genre/?id=${id}`,
  IMAGES: '/image/url',
}

