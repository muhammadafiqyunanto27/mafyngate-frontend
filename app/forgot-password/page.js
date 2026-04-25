'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-primary/10 blur-[60px] md:blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[70%] rounded-full bg-indigo-500/5 blur-[60px] md:blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px]"
      >
        {/* Back */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Login
        </Link>

        {/* Logo */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 overflow-hidden shadow-2xl shadow-primary/40 mb-6">
            <img src="/logo.png?v=8" alt="MafynGate" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">Lupa Password?</h1>
          <p className="text-muted-foreground font-medium max-w-xs">
            Masukkan email kamu dan kami akan kirimkan link reset password.
          </p>
        </div>

        <div className="bg-card border border-border p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {sent ? (
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
                  <h2 className="text-xl font-bold text-foreground mb-2">Email Terkirim!</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Kalau email <strong className="text-foreground">{email}</strong> terdaftar, link reset password sudah dikirim.
                    <br /><br />
                    Cek <strong>inbox</strong> atau <strong>folder spam</strong> kamu.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3.5 font-bold text-white bg-primary rounded-2xl hover:opacity-90 transition-all text-sm"
                >
                  Kembali ke Login
                </Link>
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
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {error}
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-widest px-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      autoFocus
                      placeholder="name@example.com"
                      suppressHydrationWarning
                      className="w-full pl-12 pr-4 py-3.5 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50 font-medium"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  suppressHydrationWarning
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 font-bold text-white bg-primary rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98] shadow-xl shadow-primary/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 italic opacity-80">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Mengirim...
                    </span>
                  ) : (
                    <>
                      Kirim Link Reset
                      <Mail className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
