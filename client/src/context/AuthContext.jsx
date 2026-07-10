import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('sg_token'));

  const fetchUser = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get('/users/me');
      setUser(data.data);
    } catch {
      localStorage.removeItem('sg_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { user, token: t } = data.data;
    localStorage.setItem('sg_token', t);
    setToken(t);
    setUser(user);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    return user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    const { user, token: t } = data.data;
    localStorage.setItem('sg_token', t);
    setToken(t);
    setUser(user);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    return user;
  };

  const logout = () => {
    localStorage.removeItem('sg_token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    toast.success('Logged out safely');
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const value = { user, loading, token, login, register, logout, updateUser, isAdmin: user?.role === 'admin' };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
