import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cf_token'));
  const [loading, setLoading] = useState(true);

  // Monitor access token verification
  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Session-expire event handler
  useEffect(() => {
    const handleSessionExpired = () => {
      console.warn('[AuthContext] Session expired event triggered locally.');
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
      if (res?.data) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('[AuthContext] fetchMe session validation failed:', err.message);
      localClearAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res && res.token) {
      localStorage.setItem('cf_token', res.token);
      localStorage.setItem('cf_refresh_token', res.refreshToken);
      setToken(res.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res?.message || 'Login failed');
  };

  const register = async (userData) => {
    // Register unverified profile; will require OTP verification page redirection next
    const res = await api.post('/auth/register', userData);
    if (res && res.status === 'success') {
      return res;
    }
    throw new Error(res?.message || 'Registration failed');
  };

  const verifyEmail = async (email, otp) => {
    const res = await api.post('/auth/verify-email', { email, otp });
    if (res && res.status === 'success') {
      if (res.token) {
        localStorage.setItem('cf_token', res.token);
        localStorage.setItem('cf_refresh_token', res.refreshToken);
        setToken(res.token);
        setUser(res.data.user);
      }
      return res;
    }
    throw new Error(res?.message || 'Email verification failed');
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('cf_refresh_token');
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (e) {
      console.error('[AuthContext] Remote logout failed:', e.message);
    }
    localClearAuth();
  };

  const logoutAllDevices = async () => {
    try {
      await api.post('/auth/logout-all');
    } catch (e) {
      console.error('[AuthContext] Remote logout all failed:', e.message);
    }
    localClearAuth();
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    if (res && res.status === 'success') {
      return res;
    }
    throw new Error(res?.message || 'Failed to dispatch reset instructions');
  };

  const resetPassword = async (token, password) => {
    const res = await api.post('/auth/reset-password', { token, password });
    if (res && res.status === 'success') {
      return res;
    }
    throw new Error(res?.message || 'Failed to reset password');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        verifyEmail,
        logout,
        logoutAllDevices,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};