'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, UserPlus, ShieldCheck, ArrowRight } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

// Compute backend URL at click-time (avoids Next.js SSR caching wrong value)
const getBackendUrl = () => {
  if (typeof window === 'undefined') return '';
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.') || h.startsWith('10.')) {
    return `http://${h}:5000`;
  }
  return 'https://api.mafyngate.web.id';
};

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user, loading: authLoading, serverError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading) return <LoadingScreen />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 503) {
        setError(msg || 'Server / database sedang mati. Coba lagi dalam beberapa menit.');
      } else if (status === 500) {
        setError(msg || 'Konfigurasi server bermasalah. Hubungi admin.');
      } else {
        setError(msg || 'Pendaftaran gagal. Pastikan email belum terdaftar.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-primary/20 blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px] animation-delay-2000"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px]"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 overflow-hidden shadow-2xl shadow-primary/40 mb-6 group hover:scale-105 transition-transform duration-500">
               <img src="/logo.png?v=8" alt="MafynGate" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">Join MafynGate</h1>
            <p className="text-muted-foreground font-medium">Create your secure account today</p>
          </div>

          <div className="bg-card border border-border p-8 rounded-[2rem] shadow-2xl shadow-slate-900/10 backdrop-blur-xl relative overflow-hidden">
            {/* Global server error (DB down / JWT missing) */}
            {serverError && !error && (
               <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="mb-6 p-4 text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 font-medium"
               >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  ⚠️ {serverError}
               </motion.div>
            )}
            {error && (
               <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="mb-6 p-4 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 font-medium"
               >
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                  {error}
               </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                   </div>
                   <input 
                    type="email" 
                    required 
                    placeholder="name@example.com"
                    suppressHydrationWarning
                    className="w-full pl-12 pr-4 py-3.5 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50 font-medium" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-widest px-1">Password</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                   </div>
                   <input 
                    type="password" 
                    required 
                    placeholder="Create a strong password"
                    suppressHydrationWarning
                    className="w-full pl-12 pr-4 py-3.5 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50 font-medium" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                suppressHydrationWarning
                className="w-full flex items-center justify-center gap-3 px-4 py-4 mt-4 font-bold text-white bg-primary rounded-2xl hover:bg-primary-600 disabled:opacity-50 transition-all active:scale-[0.98] shadow-xl shadow-primary/20"
              >
                {loading ? (
                  <span className="flex items-center gap-2 italic opacity-80">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Creating...
                  </span>
                ) : (
                  <>
                    Create Account
                    <UserPlus className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
               <div className="absolute inset-0 flex items-center text-border"><hr className="w-full" /></div>
               <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest"><span className="bg-card px-4 text-muted-foreground">Or register with</span></div>
            </div>

            <button
              type="button"
              suppressHydrationWarning
              onClick={() => { window.location.href = `${getBackendUrl()}/auth/google`; }}
              className="w-full flex items-center justify-center gap-3 py-3.5 border border-border rounded-2xl hover:bg-muted hover:border-primary/30 transition-all font-bold text-sm group"
            >
              {/* Official Google G logo */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Daftar dengan Google</span>
            </button>
          </div>

          <p className="mt-8 text-center text-muted-foreground font-medium">
            Already have an account? <Link href="/login" className="inline-flex items-center gap-1 text-primary hover:text-primary-600 font-bold hover:underline underline-offset-4 decoration-2">Sign in here <ArrowRight className="w-4 h-4" /></Link>
          </p>
        </motion.div>
      </div>

      {/* Side Graphic */}
      <div className="hidden lg:flex flex-1 bg-slate-900 border-l border-white/5 items-center justify-center relative">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
         <div className="max-w-md text-center space-y-6 relative z-10 px-12">
            <motion.div 
               animate={{ y: [0, -15, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
               className="p-4  glass flex items-center justify-center shadow-primary/20 shadow-2xl overflow-hidden aspect-square mb-8 mx-auto w-48"
            >
               <img src="/logo.png?v=8" alt="MafynGate" className="w-full h-full object-cover " />
            </motion.div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Join the Future of Privacy</h2>
            <p className="text-slate-400 leading-relaxed font-medium">Create your gateway to secure messaging, high-definition video calls, and instant smart notifications. All in one stateless, high-speed platform.</p>
         </div>
      </div>
    </div>
  );
}
