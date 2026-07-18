import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Demo user — used when no account is logged in
const DEMO_USER = {
  _id: 'demo_user_001',
  name: 'Demo User',
  email: 'demo@safeguard.ai',
  role: 'user',
  onboardingComplete: true,
  phone: '',
  location: { lat: 12.9716, lng: 77.5946, address: 'Bengaluru, India' },
  createdAt: new Date().toISOString(),
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('sg_token'));

  const fetchUser = useCallback(async () => {
    if (!token) {
      // No token — auto-login with demo user so app opens directly
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/users/me');
      setUser(data.data);
    } catch {
      // Token invalid — fall back to demo user
      localStorage.removeItem('sg_token');
      setToken(null);
      setUser(DEMO_USER);
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
    setUser(DEMO_USER); // After logout, fall back to demo user
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
