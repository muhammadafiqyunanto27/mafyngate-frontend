'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../lib/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await api.get('/user/me');
      setUser(res.data.data);
      return res.data.data;
    } catch (err) {
      setUser(null);
      throw err;
    }
  };

  // Alias for consistent naming
  const updateUser = fetchUser;

  useEffect(() => {
    // Safety timeout: If auth takes more than 15s (e.g. server/DB down),
    // we stop showing the loading screen so the user can at least see the landing page/error.
    const safetyTimer = setTimeout(() => {
      setLoading(curr => {
        if (curr) console.warn('[Auth] Safety timeout triggered. Forcing UI load.');
        return false;
      });
    }, 15000);

    const initAuth = async () => {
      try {
        await fetchUser();
      } catch (err) {
        try {
          const res = await api.post('/auth/refresh');
          setAccessToken(res.data.data.accessToken);
          await fetchUser();
        } catch (refreshErr) {
          setUser(null);
        }
      } finally {
        setLoading(false);
        clearTimeout(safetyTimer);
      }
    };
    initAuth();
    return () => clearTimeout(safetyTimer);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setAccessToken(res.data.data.accessToken);
      setUser(res.data.data.user);
      router.push('/dashboard');
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      // We don't set loading false here because router.push will 
      // lead to a new mount or a re-init if needed, 
      // but if the redirect fails, we should be able to recovery.
      // However, fetchUser in initAuth will naturally handle the rest.
      setTimeout(() => setLoading(false), 1000); 
    }
  };

  const register = async (email, password) => {
    await api.post('/auth/register', { email, password });
    await login(email, password);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
      router.push('/');
    }
  };

  const updateProfile = async (data) => {
    const res = await api.patch('/user/me', data);
    setUser(res.data.data);
    return res.data.data;
  };

  const deleteAccount = async () => {
    await api.delete('/user/me');
    setAccessToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      updateProfile, 
      deleteAccount, 
      fetchUser,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
