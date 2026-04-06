'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShieldCheck, Menu, Camera, Mail, KeyRound, CalendarDays, Award, Zap, Star } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const [menuOpen, setMenuOpen] = useState(false);

  if (loading || !user) return <div className="flex h-screen items-center justify-center bg-slate-50"></div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-hidden">
      <Sidebar activePath="/profile" isOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} />
      <AnimatedBackground />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 animate-blob"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-fuchsia-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 animate-blob animation-delay-2000"></div>

        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm z-10 sticky top-0 md:hidden">
           <div className="flex items-center gap-2 text-indigo-600">
             <Menu className="w-6 h-6 text-slate-600 cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} />
            <ShieldCheck className="w-6 h-6 ml-2" />
          </div>
        </header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 p-4 sm:p-6 lg:p-8"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
               <div className="h-40 sm:h-56 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
               </div>

               <div className="px-6 sm:px-10 pb-8 relative">
                 <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20 sm:-mt-24 mb-8 relative z-10">
                    <motion.div whileHover={{ scale: 1.05 }} className="relative group">
                      <div className="w-40 h-40 rounded-full bg-white p-2 shadow-2xl shadow-indigo-200/50">
                         <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-6xl text-white font-extrabold shadow-inner">
                           {user.email.charAt(0).toUpperCase()}
                         </div>
                      </div>
                      <button className="absolute bottom-2 right-2 p-3 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                        <Camera className="w-5 h-5" />
                      </button>
                    </motion.div>
                    
                    <div className="text-center sm:text-left mb-4 sm:mb-2">
                       <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">System Admin</h1>
                       <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                         <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                         </span>
                         <p className="text-emerald-500 font-bold text-sm uppercase tracking-wide">Online & Verified</p>
                       </div>
                    </div>

                    <div className="flex-1 flex justify-center sm:justify-end gap-3 mb-4 sm:mb-2 w-full sm:w-auto">
                       <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-semibold shadow-sm hover:bg-indigo-100 transition">
                          Edit Profile
                       </motion.button>
                    </div>
                 </div>

                 {/* Info Cards inside Header */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/80 backdrop-blur-sm flex items-start gap-4 hover:shadow-md transition">
                       <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-500"><Mail className="w-6 h-6"/></div>
                       <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                         <p className="text-slate-800 font-semibold">{user.email}</p>
                       </div>
                    </div>
                    <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/80 backdrop-blur-sm flex items-start gap-4 hover:shadow-md transition">
                       <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-500"><KeyRound className="w-6 h-6"/></div>
                       <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Security</p>
                         <p className="text-slate-800 font-semibold">2FA Enabled</p>
                       </div>
                    </div>
                    <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/80 backdrop-blur-sm flex items-start gap-4 hover:shadow-md transition">
                       <div className="p-3 bg-white rounded-xl shadow-sm text-amber-500"><CalendarDays className="w-6 h-6"/></div>
                       <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Member Since</p>
                         <p className="text-slate-800 font-semibold">{"April 2026"}</p>
                       </div>
                    </div>
                 </div>

               </div>
            </motion.div>

            {/* Achievement section */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/40 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Productivity Score</h3>
                    <div className="flex items-end gap-2">
                       <span className="text-4xl font-black text-slate-800">98</span>
                       <span className="text-lg font-bold text-emerald-500 mb-1">+5%</span>
                    </div>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <Zap className="w-10 h-10" />
                  </div>
               </div>

               <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-900/20 border border-slate-800 flex items-center justify-between relative overflow-hidden">
                  <div className="absolute right-0 top-0 -mr-10 -mt-10 opacity-20"><Star className="w-40 h-40 text-amber-400 fill-amber-400" /></div>
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-2">Platform Status</h3>
                    <div className="flex items-center gap-3">
                       <span className="text-3xl font-black text-white">Pro Tier</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-3 font-medium">Access to Advanced tools</p>
                  </div>
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-amber-400/20 flex items-center justify-center text-amber-400 border border-amber-400/30 backdrop-blur-sm">
                    <Award className="w-8 h-8" />
                  </div>
               </div>
            </motion.div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
