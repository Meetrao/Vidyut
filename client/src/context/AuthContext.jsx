import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Inject token on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ed_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ed_token'));
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (tkn) => {
    try {
      const res = await API.get('/auth/me', {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      setUser(res.data);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('ed_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchMe(token);
    else setLoading(false);
  }, [token, fetchMe]);

  const login = (tkn, userData) => {
    localStorage.setItem('ed_token', tkn);
    setToken(tkn);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('ed_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { API };
