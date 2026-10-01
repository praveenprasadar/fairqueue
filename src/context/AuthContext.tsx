import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { adminApi } from '../services/api/adminApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved token on init
    const savedToken = localStorage.getItem('fairqueue_admin_token');
    const savedUser = localStorage.getItem('fairqueue_admin_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        if (parsedUser.role === 'ADMIN') {
          setToken(savedToken);
          setUser(parsedUser);
        } else {
          localStorage.removeItem('fairqueue_admin_token');
          localStorage.removeItem('fairqueue_admin_user');
        }
      } catch (e) {
        localStorage.removeItem('fairqueue_admin_token');
        localStorage.removeItem('fairqueue_admin_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await adminApi.login(email, pass);
      if (res.user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin role required');
      }
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('fairqueue_admin_token', res.token);
      localStorage.setItem('fairqueue_admin_user', JSON.stringify(res.user));
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fairqueue_admin_token');
    localStorage.removeItem('fairqueue_admin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && user?.role === 'ADMIN',
        isLoading,
        login,
        logout,
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
