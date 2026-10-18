import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Users,
  FolderKanban,
  Clock,
  Lock,
  RefreshCw,
  Loader2,
  AlertCircle,
  Sun,
  Moon,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { AdminUserSummary } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface AdminDashboardPageProps {
  onBackToWorkspace: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onBackToWorkspace }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load admin user metrics:', err);
      setError(err.response?.data?.message || 'Failed to fetch user metrics. Ensure you have ROLE_ADMIN rights.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const totalPlans = users.reduce((acc, u) => acc + (u.planCount || 0), 0);

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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToWorkspace}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Back to Workspace"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src="/logo.png"
              alt="Quest Planner"
              className="w-9 h-9 rounded-xl object-contain shadow-md shadow-indigo-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-base sm:text-lg">Admin Oversight</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                  Role: Admin
                </span>
              </div>
              <p className="hidden sm:block text-xs text-neutral-400">Quest Planner Platform Metrics</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchUsers}
              disabled={isLoading}
              title="Refresh users"
              className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-semibold text-xs text-neutral-700 dark:text-neutral-300">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="hidden md:inline-block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {user?.username}
              </span>
              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Strict Privacy Constraint Banner */}
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/40 dark:from-indigo-950/40 dark:via-neutral-900 dark:to-neutral-900 p-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                <span>Strict User Privacy Guard Active</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-normal text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Zero-Knowledge Canvas Isolation
                </span>
              </h3>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                As an Administrator, you have aggregate visibility into registered users and the total count of plans created.
                To protect user confidentiality, <strong>you cannot open, view, inspect, or modify</strong> the canvas contents, To-Do checklists, sticky notes, or ER diagrams belonging to any user.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Registered Users</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold tracking-tight">{totalUsers}</div>
            <p className="text-[11px] text-neutral-400 mt-1">Total active accounts on Quest Planner</p>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Total Plans Created</span>
              <FolderKanban className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold tracking-tight">{totalPlans}</div>
            <p className="text-[11px] text-neutral-400 mt-1">Aggregated workspace boards across all users</p>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Avg Plans / User</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {totalUsers > 0 ? (totalPlans / totalUsers).toFixed(1) : '0'}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">Average user workspace activity</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">User Directory</h2>
              <p className="text-xs text-neutral-400 mt-0.5">High-level account metrics and board creation statistics</p>
            </div>
            <button
              onClick={onBackToWorkspace}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Open My Workspace &rarr;
            </button>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-400">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-500 mb-3" />
              <p className="text-xs">Loading user registry from backend...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">{error}</p>
              <button
                onClick={fetchUsers}
                className="px-3.5 py-1.5 text-xs rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700"
              >
                Retry
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-neutral-400 text-xs">No users registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-850/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-mono uppercase tracking-wider text-[11px]">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Joined Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Total Plans Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-850/40 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-700 dark:text-neutral-300">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {u.username}
                              {user?.id === u.id && (
                                <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-normal">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-neutral-400">ID: #{u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap font-mono text-neutral-600 dark:text-neutral-300">
                        {u.email}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                            u.role === 'ROLE_ADMIN'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {u.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                        {formatDate(u.createdAt)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right font-mono">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold">
                          {u.planCount} {u.planCount === 1 ? 'plan' : 'plans'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
