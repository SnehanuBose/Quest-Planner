import React, { useState } from 'react';
import { Lock, User as UserIcon, ArrowRight, AlertCircle, Loader2, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister, onLoginSuccess }) => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await login({ username: username.trim(), password });
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid username or password.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-neutral-900 dark:text-neutral-100 transition-colors relative">
      {/* Dark Mode Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img
          src="/logo.png"
          alt="Quest Planner"
          className="w-14 h-14 rounded-2xl object-contain shadow-xl shadow-indigo-500/25 mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold tracking-tight">Welcome to Quest Planner</h2>
        <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          Sign in to access your private workspace, tasks, and visual sketches
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-neutral-900 py-8 px-6 shadow-xl shadow-neutral-200/50 dark:shadow-neutral-950/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. alex or alex@example.com"
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 text-center text-xs text-neutral-500 dark:text-neutral-400">
            Don't have an account yet?{' '}
            <button
              onClick={onNavigateToRegister}
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
