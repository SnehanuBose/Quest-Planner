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
  CheckCircle2,
  Moon,
  Sun,
  LogOut,
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to fetch admin users:', err);
      const msg = err.response?.data?.message || 'Failed to load user oversight registry.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const totalPlans = users.reduce((acc, curr) => acc + (curr.planCount || 0), 0);

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
    <div className="min-h-screen bg-[#faf8f2] dark:bg-[#12110e] flex flex-col text-stone-900 dark:text-stone-100 transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/85 dark:bg-[#181611]/85 border-b border-amber-200/60 dark:border-amber-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToWorkspace}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-amber-100/50 dark:hover:bg-[#1f1b14] transition-colors"
              title="Back to Workspace"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src="/logo.png"
              alt="Quest Planner"
              className="w-9 h-9 rounded-xl object-contain shadow-md shadow-amber-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-base sm:text-lg">Admin Oversight</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                  Role: Admin
                </span>
              </div>
              <p className="hidden sm:block text-xs text-stone-400">Quest Planner Platform Metrics</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchUsers}
              disabled={isLoading}
              title="Refresh users"
              className="p-2 rounded-lg text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-amber-100/50 dark:hover:bg-[#1f1b14] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-amber-100/50 dark:hover:bg-[#1f1b14] transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="h-4 w-px bg-amber-200/60 dark:bg-amber-900/40 mx-1" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-200 dark:bg-amber-900/60 flex items-center justify-center font-semibold text-xs text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="hidden md:inline-block text-xs font-medium text-stone-700 dark:text-stone-300">
                {user?.username}
              </span>
              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
        <div className="rounded-2xl border border-amber-300/70 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 dark:from-amber-950/30 dark:via-[#181611] dark:to-[#181611] p-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Strict User Privacy Guard Active</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-normal text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Zero-Knowledge Canvas Isolation
                </span>
              </h3>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                As an Administrator, you have aggregate visibility into registered users and the total count of plans created.
                To protect user confidentiality, <strong>you cannot open, view, inspect, or modify</strong> the canvas contents, To-Do checklists, sticky notes, sketches, or images belonging to any user.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-white dark:bg-[#181611] p-5 shadow-sm">
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Registered Users</span>
              <Users className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold tracking-tight">{totalUsers}</div>
            <p className="text-[11px] text-stone-400 mt-1">Total active accounts on Quest Planner</p>
          </div>

          <div className="rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-white dark:bg-[#181611] p-5 shadow-sm">
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Total Plans Created</span>
              <FolderKanban className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold tracking-tight">{totalPlans}</div>
            <p className="text-[11px] text-stone-400 mt-1">Aggregated workspace boards across all users</p>
          </div>

          <div className="rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-white dark:bg-[#181611] p-5 shadow-sm">
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Avg Plans / User</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {totalUsers > 0 ? (totalPlans / totalUsers).toFixed(1) : '0'}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Average user workspace activity</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-amber-200/70 dark:border-amber-900/40 bg-white dark:bg-[#181611] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">User Directory</h2>
              <p className="text-xs text-stone-400 mt-0.5">High-level account metrics and board creation statistics</p>
            </div>
            <button
              onClick={onBackToWorkspace}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Open My Workspace &rarr;
            </button>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-stone-400">
              <Loader2 className="w-7 h-7 animate-spin text-amber-500 mb-3" />
              <p className="text-xs">Loading user registry from backend...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600 dark:text-red-400 flex flex-col items-center justify-center">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-4 px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-stone-400 text-sm">
              No registered users found in the system.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-amber-50/50 dark:bg-[#14120e] text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 border-b border-amber-200/60 dark:border-amber-900/40">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 font-medium">User ID</th>
                    <th scope="col" className="px-6 py-3.5 font-medium">Username</th>
                    <th scope="col" className="px-6 py-3.5 font-medium">Email</th>
                    <th scope="col" className="px-6 py-3.5 font-medium">Role</th>
                    <th scope="col" className="px-6 py-3.5 font-medium">Joined Date</th>
                    <th scope="col" className="px-6 py-3.5 font-medium text-right">Total Plans</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 dark:divide-amber-900/30">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-amber-50/40 dark:hover:bg-[#1f1b14] transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-stone-400">
                        #{u.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-stone-900 dark:text-stone-100">
                        {u.username}
                      </td>
                      <td className="px-6 py-4 text-stone-500 dark:text-stone-400 text-xs">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            u.role === 'ROLE_ADMIN'
                              ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-400">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-mono">
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
