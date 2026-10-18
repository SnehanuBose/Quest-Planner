import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';
import { authApi, clearAuthSession, setAuthSession, TOKEN_STORAGE } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE.ACCESS_TOKEN) || localStorage.getItem(TOKEN_STORAGE.LEGACY_TOKEN)
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE.REFRESH_TOKEN)
  );
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(TOKEN_STORAGE.USER_DATA);
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
    const activeAccessToken = res.accessToken || res.token || '';
    const activeRefreshToken = res.refreshToken || '';

    const userData: User = {
      id: res.id,
      username: res.username,
      email: res.email,
      role: res.role,
    };

    setAuthSession(activeAccessToken, activeRefreshToken);
    localStorage.setItem(TOKEN_STORAGE.USER_DATA, JSON.stringify(userData));

    setAccessToken(activeAccessToken);
    setRefreshToken(activeRefreshToken);
    setUser(userData);
  };

  const logout = () => {
    const currentRefreshToken =
      refreshToken || localStorage.getItem(TOKEN_STORAGE.REFRESH_TOKEN);

    // Revoke refresh token on backend
    if (currentRefreshToken) {
      authApi.logout(currentRefreshToken);
    }

    clearAuthSession();
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  useEffect(() => {
    // Sync with logout events (e.g. from axios 401 interceptor when refresh fails)
    const handleLogoutEvent = () => {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
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
        token: accessToken,
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken && !!user,
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
