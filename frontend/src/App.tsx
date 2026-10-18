import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Dashboard } from './components/dashboard/Dashboard';
import { CanvasPage } from './components/canvas/CanvasPage';

export const App: React.FC = () => {
  // Simple, robust client-side routing
  const [currentBoardId, setCurrentBoardId] = useState<number | null>(() => {
    const match = window.location.pathname.match(/\/boards\/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  });

  useEffect(() => {
    const handlePopState = () => {
      const match = window.location.pathname.match(/\/boards\/(\d+)/);
      setCurrentBoardId(match ? parseInt(match[1], 10) : null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToBoard = (id: number) => {
    window.history.pushState({}, '', `/boards/${id}`);
    setCurrentBoardId(id);
  };

  const navigateToDashboard = () => {
    window.history.pushState({}, '', '/');
    setCurrentBoardId(null);
  };

  return (
    <ThemeProvider>
      {currentBoardId !== null ? (
        <CanvasPage boardId={currentBoardId} onBack={navigateToDashboard} />
      ) : (
        <Dashboard onSelectBoard={navigateToBoard} />
      )}
    </ThemeProvider>
  );
};

export default App;
