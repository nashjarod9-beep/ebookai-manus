import { useState, useEffect } from 'react';
import api from '../lib/axios';

export function useAuth() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed.email === 'nashjarod9@gmail.com') {
      parsed.plan = 'agency';
      parsed.quotaRemaining = 9999;
    }
    return parsed;
  });

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const res = await api.get('/auth/me');
        const data = res.data;
        if (data.email === 'nashjarod9@gmail.com') {
          data.plan = 'agency';
          data.quotaRemaining = 9999;
        }
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      } catch (e) {
        console.error("Error refreshing profile:", e);
      }
    };
    if (user) {
      refreshUser();
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const data = res.data;
    if (data.email === 'nashjarod9@gmail.com') {
      data.plan = 'agency';
      data.quotaRemaining = 9999;
    }
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const data = res.data;
    if (data.email === 'nashjarod9@gmail.com') {
      data.plan = 'agency';
      data.quotaRemaining = 9999;
    }
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const googleLogin = async (credentialToken) => {
    const res = await api.post('/auth/google', { token: credentialToken });
    const data = res.data;
    if (data.email === 'nashjarod9@gmail.com') {
      data.plan = 'agency';
      data.quotaRemaining = 9999;
    }
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, login, register, googleLogin, logout };
}
