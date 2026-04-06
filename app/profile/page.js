'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShieldCheck, Menu, Camera, Mail, KeyRound, CalendarDays } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex h-screen items-center justify-center bg-slate-50"></div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar activePath="/profile" />

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
          transition={{ duration: 0.4 }}
          className="flex-1 p-4 sm:p-6 lg:p-8"
        >
          <div className="max-w-3xl mx-auto">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
            >
               {/* Cover Image */}
               <div className="h-32 sm:h-48 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 relative">
                  <div className="absolute inset-0 bg-black/10"></div>
               </div>

               {/* Profile Info */}
               <div className="px-6 sm:px-10 pb-10 relative">
                 <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-20 mb-8 relative z-10">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-lg shadow-indigo-100">
                         <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-4xl text-white font-bold">
                           {user.email.charAt(0).toUpperCase()}
                         </div>
                      </div>
                      <button className="absolute bottom-1 right-1 p-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-center sm:text-left mb-2">
                       <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin User</h1>
                       <p className="text-slate-500 font-medium">Standard Account</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex items-start gap-4">
                       <div className="p-3 bg-white rounded-lg shadow-sm text-indigo-600"><Mail className="w-5 h-5"/></div>
                       <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                         <p className="text-slate-800 font-medium">{user.email}</p>
                       </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex items-start gap-4">
                       <div className="p-3 bg-white rounded-lg shadow-sm text-emerald-600"><KeyRound className="w-5 h-5"/></div>
                       <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Security</p>
                         <p className="text-slate-800 font-medium">Password Protected</p>
                       </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex items-start gap-4">
                       <div className="p-3 bg-white rounded-lg shadow-sm text-rose-600"><ShieldCheck className="w-5 h-5"/></div>
                       <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role & Permissions</p>
                         <p className="text-slate-800 font-medium">Full Access</p>
                       </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex items-start gap-4">
                       <div className="p-3 bg-white rounded-lg shadow-sm text-amber-600"><CalendarDays className="w-5 h-5"/></div>
                       <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Member Since</p>
                         <p className="text-slate-800 font-medium">{"Joined Recently"}</p>
                       </div>
                    </div>
                 </div>

               </div>
            </motion.div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
