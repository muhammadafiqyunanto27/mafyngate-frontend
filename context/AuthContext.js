'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../lib/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null); // 503/500 server-level errors
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await api.get('/user/me');
      setUser(res.data.data);
      setServerError(null);
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
        // If it's a 503/500 server error, surface it — don't silently fail
        const status = err.response?.status;
        if (status === 503 || status === 500) {
          const msg = err.response?.data?.message || 'Server sedang bermasalah. Coba lagi nanti.';
          setServerError(msg);
        }
        setUser(null);
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
    setServerError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      setAccessToken(res.data.data.accessToken);
      setUser(res.data.data.user);
      router.push('/dashboard');
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      // Ensure loading is always cleared even if router.push is slow
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const register = async (email, password) => {
    // Register first, then login — propagate real server errors
    await api.post('/auth/register', { email, password });
    await login(email, password);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
      setServerError(null);
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
      serverError,
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

