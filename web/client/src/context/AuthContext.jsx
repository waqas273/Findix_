import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('findix_auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data?.user || res.data.user);
        } catch (error) {
          console.warn('Session expired or invalid token');
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const newToken = res.data.token || res.data.data?.token;
    const userData = res.data.data?.user || res.data.user;
    if (newToken) {
      localStorage.setItem('findix_auth_token', newToken);
      setToken(newToken);
    }
    setUser(userData);
    return res.data;
  };

  const googleLogin = async (credential) => {
    const res = await api.post('/auth/google', { credential });
    const newToken = res.data.token || res.data.data?.token;
    const userData = res.data.data?.user || res.data.user;
    if (newToken) {
      localStorage.setItem('findix_auth_token', newToken);
      setToken(newToken);
    }
    setUser(userData);
    return res.data;
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    const newToken = res.data.token || res.data.data?.token;
    const userData = res.data.data?.user || res.data.user;
    if (newToken) {
      localStorage.setItem('findix_auth_token', newToken);
      setToken(newToken);
    }
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('findix_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        googleLogin,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
