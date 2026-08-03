import axios from 'axios';

// Create a configured Axios client instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Enables standard HttpOnly cookie transmission
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject Kiosk Hardware Auth headers if device is set up
apiClient.interceptors.request.use(
  (config) => {
    const kioskId = localStorage.getItem('kiosk_device_id');
    const kioskSecret = localStorage.getItem('kiosk_device_secret');
    if (kioskId && kioskSecret) {
      config.headers['x-kiosk-id'] = kioskId;
      config.headers['x-kiosk-secret'] = kioskSecret;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Trap 401 and 403 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401, check if we need to redirect or clear state
    if (error.response && error.response.status === 401) {
      console.warn('[API Client] Unauthorized request detected (401). Clearing session states...');
      
      // We can trigger a custom event or let AuthContext handle session expiry dynamically
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('auth:unauthorized');
        window.dispatchEvent(event);
      }
    } else if (error.response && error.response.status === 403) {
      console.warn('[API Client] Forbidden request detected (403). Redirecting to unauthorized...');
      if (typeof window !== 'undefined' && window.location.pathname !== '/unauthorized') {
        window.location.href = '/unauthorized';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

