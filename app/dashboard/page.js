'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Zap, 
  TrendingUp, 
  ArrowUpRight,
  Plus
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import TodoList from '../../components/TodoList';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Active Sessions', value: '12', change: '+2', icon: Activity, color: 'text-emerald-500 bg-emerald-500/10' },
  { label: 'Total Users', value: '840', change: '+12%', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
  { label: 'Storage Used', value: '2.4 GB', change: '80%', icon: Zap, color: 'text-amber-500 bg-amber-500/10' },
  { label: 'Uptime', value: '99.9%', change: '+0.1%', icon: TrendingUp, color: 'text-indigo-500 bg-indigo-500/10' },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <DashboardLayout pageTitle="Command Center">
      <div className="space-y-10 pb-10">
        
        {/* Top Hero Banner */}
        <section className="relative group perspective-1000">
           <div className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-700 via-primary-600 to-primary-800 text-white shadow-2xl overflow-hidden relative border border-white/10">
              <div className="absolute top-0 right-0 w-[40%] h-full bg-white/5 skew-x-[-20deg] translate-x-[20%] transition-transform group-hover:translate-x-[15%] duration-700"></div>
              
              <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
                 <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold backdrop-blur-md border border-white/10 uppercase tracking-widest">
                       <Zap className="w-3.5 h-3.5 fill-current" />
                       <span>Extreme Performance Mode</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tight leading-[1.1]">
                       Welcome, <span className="text-indigo-200">{user.name || user.email.split('@')[0]}</span>
                    </h2>
                    <p className="text-white/70 max-w-lg text-lg font-medium leading-relaxed">
                       Your infrastructure is humming at <span className="text-white font-bold">99.98%</span> efficiency. All security protocols are active and enforced.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-4">
                       <button className="px-8 py-4 rounded-2xl bg-white text-indigo-700 font-black text-sm shadow-xl hover:shadow-indigo-500/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-2">
                          Launch Terminal <ArrowUpRight className="w-4 h-4" />
                       </button>
                       <button className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition-all active:scale-95">
                          View Infrastructure
                       </button>
                    </div>
                 </div>
                 <div className="hidden lg:flex justify-center">
                    <div className="relative">
                       <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
                       <ShieldCheck className="w-48 h-48 text-white relative z-10 drop-shadow-2xl" />
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
             <motion.div 
               key={idx}
               whileHover={{ y: -8, scale: 1.02 }}
               className="p-8 rounded-[2.5rem] glass-panel flex flex-col justify-between group transition-all duration-500 hover:border-primary/50"
             >
               <div className="flex items-center justify-between mb-8">
                  <div className={`p-4 rounded-2xl ${stat.color} shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500`}>
                     <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${stat.change.includes('+') ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 bg-slate-500/10'}`}>
                      {stat.change}
                    </span>
                  </div>
               </div>
               <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-foreground tracking-tight">{stat.value}</p>
               </div>
             </motion.div>
          ))}
        </div>

        {/* Analytics & Tasks Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 space-y-8">
             <div className="flex items-center justify-between px-4">
                <h3 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                   Active Workspace
                   <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">Syncing...</span>
                </h3>
                <button className="p-3 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:scale-110 transition-all active:scale-95">
                   <Plus className="w-6 h-6" />
                </button>
             </div>
             <div className="glass-panel rounded-[3rem] p-1 border border-white/5 overflow-hidden">
                <TodoList />
             </div>
          </div>

          <div className="space-y-8">
             {/* Dynamic Analytics Card */}
             <div className="p-8 rounded-[3rem] glass-panel space-y-8 group">
                <div className="flex items-center justify-between">
                   <h3 className="font-black text-foreground text-lg uppercase tracking-tight flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-500" />
                      Live Traffic
                   </h3>
                   <div className="flex gap-1">
                      {[1,2,3].map(i => <div key={i} className={`w-1 h-4 rounded-full bg-indigo-500/40 animate-pulse animation-delay-${i*1000}`} />)}
                   </div>
                </div>
                
                {/* Micro Chart Placeholder */}
                <div className="h-40 flex items-end justify-between gap-1.5 px-2">
                   {[40, 70, 45, 90, 65, 80, 50, 40, 85, 95, 60, 45].map((h, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 0.8 }}
                        className={`w-full rounded-t-lg bg-gradient-to-t from-primary/80 to-indigo-400/80 transition-all duration-300 group-hover:from-primary group-hover:to-indigo-500`}
                      />
                   ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Peak Output</p>
                      <p className="text-lg font-black tracking-tight">1.2 GB/s</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Latency</p>
                      <p className="text-lg font-black tracking-tight text-emerald-500">12ms</p>
                   </div>
                </div>
             </div>

             {/* Connection Status Card */}
             <div className="p-8 rounded-[3rem] bg-slate-900 border border-slate-800 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10 flex flex-col items-center text-center space-y-6 py-4">
                   <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:rotate-[360deg] transition-transform duration-[2000ms]">
                      <TrendingUp className="w-10 h-10 text-primary-400" />
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-xl font-black tracking-tight">Network Health</h4>
                      <p className="text-slate-400 text-sm leading-relaxed font-medium">Real-time optimization is active. Core systems are nominal.</p>
                   </div>
                   <button className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-black transition-all active:scale-95 flex items-center justify-center gap-2 group-hover:border-primary/50 group-hover:text-primary-400">
                      Run Optimizer
                      <Zap className="w-4 h-4 fill-current" />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
