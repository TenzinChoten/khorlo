import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/auth/me')
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    // [Reason] Drop the client user immediately; cookie clear can fail across localhost ports
    setUser(null);
    await fetchApi('/auth/logout', { method: 'POST' }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
