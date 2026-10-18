import React, { useEffect, useState, useId, useRef } from 'react';
import {
  Plus,
  Search,
  Moon,
  Sun,
  Layout,
  Clock,
  Trash2,
  ExternalLink,
  Sparkles,
  Loader2,
  FolderOpen,
  X,
  Shield,
  LogOut,
} from 'lucide-react';
import { boardApi } from '../../services/api';
import { BoardSummary } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface DashboardProps {
  onSelectBoard: (id: number) => void;
  onNavigateToAdmin?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectBoard, onNavigateToAdmin }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [formError, setFormError] = useState('');

  const modalRef = useRef<HTMLDialogElement>(null);
  const titleInputId = useId();
  const descInputId = useId();

  const loadBoards = async () => {
    try {
      setIsLoading(true);
      const data = await boardApi.getAllBoards();
      setBoards(data);
    } catch (err) {
      console.error('Failed to load boards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const openModal = () => {
    setNewTitle('');
    setNewDescription('');
    setFormError('');
    modalRef.current?.showModal();
  };

  const closeModal = () => {
    modalRef.current?.close();
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Board title is required');
      return;
    }

    try {
      setIsCreating(true);
      const created = await boardApi.createBoard({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
      });
      closeModal();
      onSelectBoard(created.id);
    } catch (err) {
      console.error('Failed to create board:', err);
      setFormError('Failed to create board. Please ensure the backend is running.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBoard = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await boardApi.deleteBoard(id);
      setBoards((prev) => prev.filter((b) => b.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete board:', err);
    }
  };

  const filteredBoards = boards.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      (b.description && b.description.toLowerCase().includes(q))
    );
  });

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Quest Planner"
              className="w-9 h-9 rounded-xl object-contain shadow-md shadow-indigo-500/20"
            />
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight text-base sm:text-lg">
                Quest Planner
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-mono">
                v1.0
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-2 sm:mx-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-neutral-100 dark:bg-neutral-800/70 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {user?.role === 'ROLE_ADMIN' && onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-300/60 dark:border-amber-800/60 text-xs font-medium transition-colors"
                title="Admin Dashboard"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Panel</span>
              </button>
            )}

            <button
              onClick={openModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Board</span>
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs"
                title={user?.email}
              >
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 leading-tight">
                  {user?.username}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {user?.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Workspace Boards
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Visual planning boards combining To-Dos, sticky notes, freehand sketches, and images.
            </p>
          </div>
          <div className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
            {boards.length} {boards.length === 1 ? 'board' : 'boards'} available
          </div>
        </div>

        {/* Board Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm">Connecting to backend at localhost:8080...</p>
          </div>
        ) : filteredBoards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 p-12 text-center max-w-lg mx-auto my-12 bg-white/50 dark:bg-neutral-900/50">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              {searchQuery ? 'No matching boards' : 'No boards created yet'}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
              {searchQuery
                ? 'Try adjusting your search query or clear the filter.'
                : 'Start organizing your thoughts, tasks, and database models on an infinite canvas.'}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Create your first board
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredBoards.map((board) => (
              <div
                key={board.id}
                onClick={() => onSelectBoard(board.id)}
                className="group relative rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 p-5 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-950/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <Layout className="w-4 h-4" />
                    </div>

                    <div className="relative">
                      {deleteConfirmId === board.id ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 p-1 rounded-lg text-xs"
                        >
                          <span className="text-red-700 dark:text-red-400 font-medium px-1">Delete?</span>
                          <button
                            onClick={(e) => handleDeleteBoard(board.id, e)}
                            className="px-2 py-0.5 rounded bg-red-600 text-white font-medium hover:bg-red-700"
                          >
                            Yes
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(null);
                            }}
                            className="px-1.5 py-0.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(board.id);
                          }}
                          aria-label="Delete board"
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {board.title}
                  </h3>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {board.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(board.updatedAt)}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Board Modal (Native Dialog with modern web guidance) */}
      <dialog
        ref={modalRef}
        onClick={(e) => {
          if (e.target === modalRef.current) closeModal();
        }}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">Create New Board</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreateBoard} className="space-y-4">
          <div>
            <label htmlFor={titleInputId} className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Board Title <span className="text-red-500">*</span>
            </label>
            <input
              id={titleInputId}
              type="text"
              placeholder="e.g. E-Commerce Microservices & DB"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (formError) setFormError('');
              }}
              className="w-full px-3.5 py-2 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor={descInputId} className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Description (optional)
            </label>
            <textarea
              id={descInputId}
              rows={3}
              placeholder="Brief summary of this board's goals and architecture..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {formError && (
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900/40">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white shadow-sm transition-all"
            >
              {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isCreating ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};
