'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, UserPlus, ShieldCheck, ArrowRight } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user, loading: authLoading } = useAuth();
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
      setError(err.response?.data?.message || 'Registration failed. Try again.');
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

            <div className="grid grid-cols-2 gap-4">
               <button 
                suppressHydrationWarning
                className="flex items-center justify-center gap-2 py-3 border border-border rounded-2xl hover:bg-muted transition-all font-bold text-sm"
               >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                  Github
               </button>
               <button 
                suppressHydrationWarning
                className="flex items-center justify-center gap-2 py-3 border border-border rounded-2xl hover:bg-muted transition-all font-bold text-sm"
               >
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545 11.027L21.114 11a11.5 11.5 0 11-3.155-8.49l-2.614 2.822a7.5 7.5 0 102.012 5.695h-4.812z"/></svg>
                  Google
               </button>
            </div>
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
