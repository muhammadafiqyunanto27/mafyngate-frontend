'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import api from '../../lib/api';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Link reset tidak valid. Minta link baru dari halaman lupa password.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirm) {
      setError('Password dan konfirmasi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset gagal. Link mungkin sudah kadaluarsa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[60%] rounded-full bg-primary/15 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px]"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 overflow-hidden shadow-2xl shadow-primary/40 mb-6">
            <img src="/logo.png?v=8" alt="MafynGate" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">Password Baru</h1>
          <p className="text-muted-foreground font-medium">Buat password baru untuk akunmu.</p>
        </div>

        <div className="bg-card border border-border p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-5 py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Password Berhasil Direset!</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Semua sesi lama sudah dikeluarkan. Kamu akan diarahkan ke halaman login...
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-5"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 font-medium"
                  >
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-widest px-1">
                    Password Baru
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      autoFocus
                      placeholder="Minimal 6 karakter"
                      suppressHydrationWarning
                      className="w-full pl-12 pr-12 py-3.5 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50 font-medium"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-widest px-1">
                    Konfirmasi Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      placeholder="Ulangi password baru"
                      suppressHydrationWarning
                      className={`w-full pl-12 pr-4 py-3.5 bg-muted/30 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50 font-medium ${
                        confirm && password !== confirm ? 'border-rose-500' : 'border-border'
                      }`}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                    />
                  </div>
                  {confirm && password !== confirm && (
                    <p className="text-xs text-rose-500 ml-1 font-medium">Password tidak cocok</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  suppressHydrationWarning
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 font-bold text-white bg-primary rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98] shadow-xl shadow-primary/20 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 italic opacity-80">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Menyimpan...
                    </span>
                  ) : (
                    <>
                      Simpan Password Baru
                      <Lock className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  Ingat password?{' '}
                  <Link href="/login" className="text-primary font-bold hover:underline">
                    Login di sini
                  </Link>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
