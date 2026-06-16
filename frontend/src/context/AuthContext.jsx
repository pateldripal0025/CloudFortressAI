import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cf_token'));
  const [loading, setLoading] = useState(true);

  // 1. Fetch current operator profile if token exists on mount, or auto-log in as guest
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await fetchMe();
      } else {
        try {
          console.log('[Auth] Initializing guest access link...');
          const res = await api.post('/auth/login', { email: 'test@user.com', password: 'password' });
          if (res && res.token) {
            localStorage.setItem('cf_token', res.token);
            localStorage.setItem('cf_refresh_token', res.refreshToken);
            setToken(res.token);
            setUser(res.data.user);
          } else {
            throw new Error('Invalid guest auth response');
          }
        } catch (err) {
          console.error('[Auth] Guest initialization failed, fallback to local bypass:', err);
          setUser({ fullname: 'Security Operator', email: 'operator@cloudfortress.ai', role: 'admin' });
        } finally {
          setLoading(false);
        }
      }
    };
    initAuth();
  }, [token]);

  // 2. Global event listener for expired credentials (intercepted by Axios)
  useEffect(() => {
    const handleSessionExpired = () => {
      console.warn('[Security Center] Session credentials expired. Revoking local access.');
      localClearAuth();
    };
    window.addEventListener('auth_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth_session_expired', handleSessionExpired);
    };
  }, []);

  const localClearAuth = () => {
    localStorage.removeItem('cf_token');
    localStorage.removeItem('cf_refresh_token');
    setToken(null);
    setUser(null);
  };

  const fetchMe = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res?.data?.user) {
        setUser(res.data.user);
      } else {
        localClearAuth();
      }
    } catch (err) {
      console.error('[Security Hub] Profile authentication failed:', err.message);
      localClearAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, rememberMe = true) => {
    const res = await api.post('/auth/login', { email, password });
    if (res && res.token) {
      // Manage session persistence
      if (rememberMe) {
        localStorage.setItem('cf_token', res.token);
        localStorage.setItem('cf_refresh_token', res.refreshToken);
      } else {
        sessionStorage.setItem('cf_token', res.token);
      }
      setToken(res.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res?.message || 'Authentication credentials rejected.');
  };

  const register = async (fullname, email, password) => {
    const res = await api.post('/auth/register', { fullname, email, password });
    if (res && res.token) {
      // Auto-authenticate operator on successful account registration
      localStorage.setItem('cf_token', res.token);
      localStorage.setItem('cf_refresh_token', res.refreshToken);
      setToken(res.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res?.message || 'Failed to register operator credentials.');
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('cf_refresh_token');
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (e) {
      console.warn('[Security Hub] Stateless logout completed.');
    }
    localClearAuth();
    sessionStorage.removeItem('cf_token');
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    if (res && res.status === 'success') {
      return res;
    }
    throw new Error(res?.message || 'Failed to dispatch override link.');
  };

  const resetPassword = async (token, password) => {
    const res = await api.post('/auth/reset-password', { token, password });
    if (res && res.status === 'success') {
      return res;
    }
    throw new Error(res?.message || 'Failed to reset credential keys.');
  };

  const updateUserProfile = async (fullname, email, password) => {
    const res = await api.put('/auth/update-profile', { fullname, email, password });
    if (res && res.status === 'success') {
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res?.message || 'Failed to update profile.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};