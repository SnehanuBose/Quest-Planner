import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Dashboard } from './components/dashboard/Dashboard';
import { CanvasPage } from './components/canvas/CanvasPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { AdminDashboardPage } from './components/admin/AdminDashboardPage';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [currentBoardId, setCurrentBoardId] = useState<number | null>(() => {
    const match = window.location.pathname.match(/\/boards\/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      const match = path.match(/\/boards\/(\d+)/);
      setCurrentBoardId(match ? parseInt(match[1], 10) : null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    const match = path.match(/\/boards\/(\d+)/);
    setCurrentBoardId(match ? parseInt(match[1], 10) : null);
  };

  const navigateToBoard = (id: number) => {
    navigateTo(`/boards/${id}`);
  };

  const navigateToDashboard = () => {
    navigateTo('/');
  };

  const navigateToAdmin = () => {
    navigateTo('/admin');
  };

  const navigateToLogin = () => {
    navigateTo('/login');
  };

  const navigateToRegister = () => {
    navigateTo('/register');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <p className="text-xs">Initializing Quest Planner...</p>
      </div>
    );
  }

  // Unauthenticated visitors
  if (!isAuthenticated) {
    if (currentPath === '/register') {
      return (
        <RegisterPage
          onNavigateToLogin={navigateToLogin}
          onRegisterSuccess={navigateToDashboard}
        />
      );
    }
    return (
      <LoginPage
        onNavigateToRegister={navigateToRegister}
        onLoginSuccess={navigateToDashboard}
      />
    );
  }

  // Protected Admin Route
  if (currentPath === '/admin') {
    if (user?.role === 'ROLE_ADMIN') {
      return <AdminDashboardPage onBackToWorkspace={navigateToDashboard} />;
    } else {
      navigateToDashboard();
    }
  }

  // Protected Canvas Route
  if (currentBoardId !== null) {
    return <CanvasPage boardId={currentBoardId} onBack={navigateToDashboard} />;
  }

  // Protected Dashboard Route
  return (
    <Dashboard
      onSelectBoard={navigateToBoard}
      onNavigateToAdmin={user?.role === 'ROLE_ADMIN' ? navigateToAdmin : undefined}
    />
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
