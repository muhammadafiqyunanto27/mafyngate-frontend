"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Video, MessageCircle, X, CheckCircle, AlertCircle, ArrowRight, Shield, Zap, Terminal, Server, Database, Key } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import LoadingScreen from "../components/LoadingScreen";
import api from "../lib/api";

export default function LandingPage() {
  const { user, loading, serverError } = useAuth();
  const router = useRouter();
  
  // Support Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return <LoadingScreen />;
  if (user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supportEmail || !supportMessage) return;
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await api.post("/user/support", {
        name: "Anonymous User (Landing Page)",
        email: supportEmail,
        message: supportMessage
      });
      setSubmitStatus("success");
      setSupportEmail("");
      setSupportMessage("");
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitStatus(null);
      }, 2000);
    } catch (err) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-900 relative overflow-hidden">
      
      {/* Subtle background - no glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Subtle grid background - no floating toys */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {serverError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-5 py-3 rounded-lg flex items-center gap-3 text-sm backdrop-blur-md">
          <AlertCircle size={16} />
          <span>Server Error: {serverError}</span>
        </div>
      )}

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 overflow-hidden rounded-lg border border-border flex items-center justify-center">
              <img src="/logo.png?v=8" alt="MafynGate" className="w-5 h-5 object-cover" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              MafynGate
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 text-sm font-medium transition-colors hover:bg-primary/90">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-20 pt-32 pb-20 px-6 max-w-3xl mx-auto flex flex-col items-center text-center min-h-[80vh] justify-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground mb-4">
          Simple, secure messaging.
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
          A real-time communication platform built for speed and privacy. No tracking, no unnecessary footprints. Just seamless chat and video.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
           <Link href="/register" className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-sm transition-colors bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2">
             Get Started
             <ArrowRight size={16} />
           </Link>
           <Link href="/guide" className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-sm text-foreground border border-border hover:bg-muted transition-colors flex items-center justify-center gap-2">
             Documentation
           </Link>
        </div>
      </main>

      {/* FEATURES SECTION */}
      <section className="relative z-20 py-16 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-border">
        
        <div className="mb-16 md:mb-24 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">Built for the future.</h2>
          <p className="text-muted-foreground text-lg">Everything you need, nothing you don&apos;t.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-8 overflow-hidden transition-all duration-500 hover:border-cyan-500/30 hover:bg-white/[0.05]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5 transition-transform duration-300 group-hover:scale-105">
                <Shield size={22} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Stateless Core</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Built on JWTs for fast and lightweight verification. Sessions are securely handled without database bloat.
              </p>
            </div>
          </div>

          <div className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-8 overflow-hidden transition-all duration-500 hover:border-cyan-500/30 hover:bg-white/[0.05]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5 transition-transform duration-300 group-hover:scale-105">
                <Video size={22} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">HD WebRTC</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Direct peer-to-peer connections for low-latency, encrypted video calls directly from your browser.
              </p>
            </div>
          </div>

          <div className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-8 overflow-hidden transition-all duration-500 hover:border-cyan-500/30 hover:bg-white/[0.05]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5 transition-transform duration-300 group-hover:scale-105">
                <Zap size={22} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Instant Sync</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Real-time websocket connections keep your messages and statuses synced instantly across all devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT SECTION */}
      <section className="relative z-20 py-16 px-6 md:px-12 bg-muted/30 border-t border-border">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-foreground mb-4">Need Help?</h2>
            <p className="text-muted-foreground text-lg max-w-md">
              Reach out to our engineering team for bug reports, questions, or general support.
            </p>
          </div>
          
          <div className="md:w-1/2 flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={() => window.open('https://wa.me/6282219785260', '_blank')}
              className="group relative flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-6 text-left overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/[0.05]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 transition-transform duration-300 group-hover:scale-105">
                  <MessageCircle size={20} strokeWidth={1.5} />
                </div>
                <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wider">WhatsApp</p>
                <p className="text-sm font-medium text-foreground">Chat Support</p>
              </div>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-6 text-left overflow-hidden transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/[0.05]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 transition-transform duration-300 group-hover:scale-105">
                  <Terminal size={20} strokeWidth={1.5} />
                </div>
                <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wider">System</p>
                <p className="text-sm font-medium text-foreground">Report Glitch</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 py-8 px-6 md:px-12 border-t border-border">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/logo.png?v=8" alt="Logo" className="w-4 h-4 opacity-50" />
            <p>© {new Date().getFullYear()} MafynGate. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
          </div>
        </div>
      </footer>

      {/* MODAL POPUP */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => !isSubmitting && setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-card border border-border rounded-xl overflow-hidden relative z-10"
            >
              <div className="flex justify-between items-center p-5 border-b border-border">
                <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Terminal size={16} className="text-blue-400" />
                  System Report
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isSubmitting}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {submitStatus === "success" ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-8 text-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-900 flex items-center justify-center mb-4 text-emerald-500">
                        <CheckCircle size={24} />
                      </div>
                      <p className="text-foreground font-medium text-sm mb-1">Report Logged</p>
                      <p className="text-muted-foreground text-xs">Our engineering team has been notified.</p>
                    </motion.div>
                  ) : (
                    <motion.form 
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit} 
                      className="flex flex-col gap-5"
                    >
                      {submitStatus === "error" && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg flex items-start gap-2 text-xs">
                          <AlertCircle size={14} className="mt-0.5 shrink-0" />
                          <p>Failed to route report. Please check your connection.</p>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Email Address</label>
                        <input 
                          required 
                          type="email" 
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          disabled={isSubmitting}
                          placeholder="user@domain.com" 
                          className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50" 
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Error Details</label>
                        <textarea 
                          required 
                          rows="3" 
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          disabled={isSubmitting}
                          placeholder="Describe the anomaly..." 
                          className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none disabled:opacity-50"
                        />
                      </div>
                      
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-lg text-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isSubmitting ? "Transmitting..." : "Submit Report"}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
