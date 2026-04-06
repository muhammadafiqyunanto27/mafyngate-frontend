'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShieldCheck, Menu } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import TodoList from '../../components/TodoList';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex h-screen items-center justify-center bg-slate-50"></div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar activePath="/dashboard" />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 shadow-sm z-10 sticky top-0 md:hidden">
           <div className="flex items-center gap-2 text-indigo-600">
             <Menu className="w-6 h-6 text-slate-600 cursor-pointer" />
            <ShieldCheck className="w-6 h-6 ml-2" />
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex-1 p-4 sm:p-6 lg:p-8"
        >
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Banner */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 shadow-xl shadow-indigo-200/50 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-20 -mb-4 w-24 h-24 bg-black opacity-10 rounded-full blur-xl animate-pulse"></div>
              
              <div className="relative z-10">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                  Welcome to Dashboard
                </h1>
                <p className="text-indigo-100 max-w-xl text-sm sm:text-base font-medium">
                  Organize your day with your personal secure tasks manager.
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <motion.div 
                 initial={{ opacity: 0, x: -10 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 transition={{ delay: 0.2 }}
                 className="lg:col-span-2"
               >
                 <TodoList />
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, x: 10 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 transition={{ delay: 0.3 }}
                 className="space-y-6"
               >
                 <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                   <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Session Status</span>
                   <span className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></span>
                     Protected
                   </span>
                   <p className="text-xs text-slate-400 mt-1">Logged in as {user.email}</p>
                 </div>
                 
                 <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck className="w-24 h-24" /></div>
                    <h3 className="font-semibold mb-2 relative z-10">Security Check</h3>
                    <p className="text-slate-300 text-sm relative z-10 leading-relaxed text-balance">
                      Your connection is running on a stateless JWT system utilizing HTTP-only cookies and in-memory variable persistence to defeat XSS vulnerabilities.
                    </p>
                 </div>
               </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
