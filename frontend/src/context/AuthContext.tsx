import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'quest_auth_token';
const USER_KEY = 'quest_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached user:', e);
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const saveAuthSession = (res: AuthResponse) => {
    const userData: User = {
      id: res.id,
      username: res.username,
      email: res.email,
      role: res.role,
    };
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(res.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    // Sync with logout events (e.g. from axios 401 interceptor)
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    setIsLoading(false);

    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, []);

  const login = async (data: LoginRequest) => {
    const res = await authApi.login(data);
    saveAuthSession(res);
  };

  const register = async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    saveAuthSession(res);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
