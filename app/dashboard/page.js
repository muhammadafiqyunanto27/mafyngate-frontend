'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect unauthenticated users
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  // Prevent flash rendering before redirect
  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <div className="p-4 bg-slate-50 border rounded-lg">
          <p className="text-slate-600">
            Welcome back, <span className="font-semibold text-slate-800">{user.email}</span>
          </p>
          <div className="mt-4 text-sm text-slate-500">
            This protected route successfully validated your session using your in-memory access token.
          </div>
        </div>
        <button 
          onClick={logout} 
          className="px-4 py-2 font-medium text-white bg-slate-800 rounded-md hover:bg-slate-900 transition-colors">
          Logout Securely
        </button>
      </div>
    </div>
  );
}
