import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to establish auth state
  const setAuthState = (userData) => {
    if (userData) {
      setUser(userData);
      setRole(userData.role);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Fetch current logged in user details to restore session.
   * If Kiosk hardware credentials are present in localStorage, use heartbeat
   * to authenticate rather than the standard /auth/me endpoint.
   */
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);

      // --- Kiosk Device Session Restoration ---
      const kioskId = localStorage.getItem('kiosk_device_id');
      const kioskSecret = localStorage.getItem('kiosk_device_secret');

      if (kioskId && kioskSecret) {
        // Attempt to validate the kiosk hardware credentials via heartbeat
        try {
          await apiClient.post('/kiosks/heartbeat');
          // If heartbeat is OK, restore the kiosk session with a synthetic user object
          setAuthState({
            role: 'KIOSK',
            name: 'Kiosk Terminal',
            kioskId,
          });
          return; // Skip standard user session restoration
        } catch (kioskErr) {
          // Heartbeat failed - the device may have been deactivated or credentials are invalid
          console.warn('[AuthContext] Kiosk heartbeat failed. Clearing hardware credentials.');
          localStorage.removeItem('kiosk_device_id');
          localStorage.removeItem('kiosk_device_secret');
          localStorage.removeItem('kiosk_device_name');
          setAuthState(null);
          return;
        }
      }

      // --- Standard User Session Restoration ---
      const res = await apiClient.get('/auth/me');
      if (res.data && res.data.data && res.data.data.user) {
        setAuthState(res.data.data.user);
      } else {
        setAuthState(null);
      }
    } catch (err) {
      setAuthState(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in standard user (email + password)
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data && res.data.data && res.data.data.user) {
        setAuthState(res.data.data.user);
        return res.data.data.user;
      }
    } catch (err) {
      setAuthState(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Authenticate this device as a Kiosk terminal using Hardware Credentials.
   * Saves credentials to localStorage for persistent sessions across page reloads.
   * @param {String} kioskId - The Kiosk MongoDB ID
   * @param {String} kioskSecret - The Kiosk hardware secret token
   */
  const loginKiosk = async (kioskId, kioskSecret) => {
    setLoading(true);
    try {
      // Temporarily store credentials so the axios interceptor includes them in headers
      localStorage.setItem('kiosk_device_id', kioskId);
      localStorage.setItem('kiosk_device_secret', kioskSecret);

      // Validate credentials by firing a heartbeat ping
      await apiClient.post('/kiosks/heartbeat');

      // Success - set kiosk role in auth state
      setAuthState({
        role: 'KIOSK',
        name: 'Kiosk Terminal',
        kioskId,
      });

      return { success: true };
    } catch (err) {
      // Heartbeat failed - clear the bad credentials and throw
      localStorage.removeItem('kiosk_device_id');
      localStorage.removeItem('kiosk_device_secret');
      setAuthState(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out user (or Kiosk device)
   */
  const logout = async () => {
    setLoading(true);
    try {
      // If this is a Kiosk device, clear localStorage. Do NOT call /auth/logout.
      const kioskId = localStorage.getItem('kiosk_device_id');
      if (kioskId) {
        localStorage.removeItem('kiosk_device_id');
        localStorage.removeItem('kiosk_device_secret');
        localStorage.removeItem('kiosk_device_name');
      } else {
        await apiClient.post('/auth/logout');
      }
    } catch (err) {
      console.error('[AuthContext] Failed to call logout endpoint:', err.message);
    } finally {
      setAuthState(null);
      setLoading(false);
    }
  };

  /**
   * Onboard and setup employee password
   */
  const setupAccount = async (token, password, confirmPassword) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/setup-account', { token, password, confirmPassword });
      if (res.data && res.data.data && res.data.data.user) {
        setAuthState(res.data.data.user);
        return res.data.data.user;
      }
    } catch (err) {
      setAuthState(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Run on mount to check if active session cookies exist
  useEffect(() => {
    fetchCurrentUser();
    
    // Listen for global 401 interceptor events
    const handleUnauthorized = () => {
      setAuthState(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        loading,
        login,
        loginKiosk,
        logout,
        setupAccount,
        fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be consumed within an AuthProvider.');
  }
  return context;
};
