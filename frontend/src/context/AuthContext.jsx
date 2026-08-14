import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    // [Reason] Session state must come from the cookie-backed /auth/me, not only the login JSON body
    const data = await fetchApi('/auth/me');
    setUser(data.user);
    return data.user;
  };

  useEffect(() => {
    refreshSession()
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return refreshSession();
  };

  const register = async (payload) => {
    await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return refreshSession();
  };

  const logout = async () => {
    // [Reason] Drop the client user immediately; cookie clear can fail across localhost ports
    setUser(null);
    await fetchApi('/auth/logout', { method: 'POST' }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
