'use client';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Activity, User, LogOut, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar({ activePath = '/dashboard' }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600">
          <ShieldCheck className="w-6 h-6" />
          <span className="font-bold text-xl tracking-tight text-slate-900">MafynGate</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Overview
        </div>
        <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activePath === '/dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
          <Activity className="w-4 h-4" />
          <span className="font-medium text-sm">Dashboard</span>
        </Link>
        <Link href="/profile" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activePath === '/profile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
          <User className="w-4 h-4" />
          <span className="font-medium text-sm">Profile</span>
        </Link>
        <Link href="/calculator" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activePath === '/calculator' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
          <Calculator className="w-4 h-4" />
          <span className="font-medium text-sm">Dev Calc</span>
        </Link>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
            <p className="text-xs text-slate-500 truncate">Authenticated User</p>
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
  );
}
