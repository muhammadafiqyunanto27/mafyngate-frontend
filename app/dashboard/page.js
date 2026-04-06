'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogOut, User, ShieldCheck, Activity, Menu } from 'lucide-react';

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
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <ShieldCheck className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight text-slate-900">MafynGate</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overview
          </div>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg transition-colors">
            <Activity className="w-4 h-4" />
            <span className="font-medium text-sm">Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
            <User className="w-4 h-4" />
            <span className="font-medium text-sm">Profile</span>
          </a>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
              <p className="text-xs text-slate-500 truncate">Admin User</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-all duration-200 active:scale-95">
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header (Mobile & Desktop) */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 shadow-sm z-10">
           <div className="flex items-center md:hidden gap-2 text-indigo-600">
             <Menu className="w-6 h-6 text-slate-600" />
            <ShieldCheck className="w-6 h-6 ml-2" />
          </div>
          <div className="flex-1 flex justify-end">
            {/* Additional Header Controls could go here */}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 shadow-lg shadow-indigo-200/50 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
              <div className="absolute bottom-0 right-10 -mb-4 w-20 h-20 bg-black opacity-10 rounded-full blur-lg"></div>
              
              <div className="relative z-10">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                  Welcome back to the portal
                </h1>
                <p className="text-indigo-100 max-w-xl text-sm sm:text-base">
                  You are securely authenticated using HTTP-only cookies and in-memory JWTs.
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Session Status</span>
                <span className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  Active
                </span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Access Level</span>
                <span className="text-2xl font-bold text-slate-800">Standard</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Authentication</span>
                <span className="text-2xl font-bold text-slate-800">Stateless JWT</span>
              </div>
            </div>

             {/* System Status Panel */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 text-sm font-semibold text-slate-800">
                Security Information
              </div>
              <div className="p-6">
                 <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="mb-2"><strong className="text-slate-800">User Email:</strong> {user.email}</p>
                    <p className="mb-2"><strong className="text-slate-800">Architecture:</strong> Next.js + Express/Prisma</p>
                    <p>This protected route successfully validated your session using your in-memory access token fetched efficiently from the server backend via Context API.</p>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
