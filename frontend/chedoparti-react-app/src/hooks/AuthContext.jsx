import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let localUser = localStorage.getItem('demo-user');
    if (!localUser) {
      localUser = JSON.stringify({
        name: 'Demo User',
        email: 'admin@demo.com',
        avatar: '',
        id: 1,
      });
      localStorage.setItem('demo-user', localUser);
    }
    setUser(JSON.parse(localUser));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login(email, password);
    if (data?.token) localStorage.setItem('token', data.token);
    if (data?.user) setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('demo-user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ loading, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}
