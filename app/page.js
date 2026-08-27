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
      
      {/* BACKGROUND AMBIENCE (Strictly Slate, Cyan, Blue - NO PURPLE) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-950/30 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-950/20 blur-[120px]" />
      </div>

      {/* SCATTERED FLOATING TOYS (Mainan mecah ke seluruh halaman) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        
        {/* Node A (Top Left) */}
        <motion.div 
          drag dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
          className="hidden md:flex absolute left-[15%] top-[25%] p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-cyan-900/50 flex-col items-center gap-2 shadow-[0_0_20px_rgba(8,145,178,0.2)] pointer-events-auto cursor-grab active:cursor-grabbing hover:bg-slate-900/80 transition-colors"
        >
          <Server size={28} className="text-cyan-400" />
          <span className="text-slate-300 font-semibold text-sm">Node_A</span>
        </motion.div>

        {/* Node B (Bottom Right) */}
        <motion.div 
          drag dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
          className="hidden md:flex absolute right-[15%] top-[65%] p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-blue-900/50 flex-col items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.2)] pointer-events-auto cursor-grab active:cursor-grabbing hover:bg-slate-900/80 transition-colors"
        >
          <Database size={28} className="text-blue-400" />
          <span className="text-slate-300 font-semibold text-sm">Node_B</span>
        </motion.div>

        {/* Terminal Log (Bottom Left) */}
        <motion.div 
          drag dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
          className="hidden md:block absolute left-[5%] bottom-[20%] p-4 bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-md shadow-2xl pointer-events-auto cursor-grab active:cursor-grabbing hover:bg-slate-950 transition-colors"
        >
          <div className="flex gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          </div>
          <motion.p 
            animate={{ opacity: [1, 0.5, 1] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-cyan-400 mb-1 font-mono text-xs font-semibold"
          >
            {">"} Establishing tunnel...
          </motion.p>
          <p className="text-slate-400 font-mono text-[10px]">{">"} Token verified.</p>
        </motion.div>

        {/* Keys (Top Right) */}
        <motion.div
          animate={{ y: [-15, 15, -15], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          drag dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
          className="absolute right-[25%] top-[15%] w-12 h-12 rounded-xl bg-slate-800/50 backdrop-blur-md border border-slate-700 flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing shadow-lg hover:bg-slate-800/80 transition-colors"
        >
          <Key size={20} className="text-slate-400" />
        </motion.div>

        {/* Lock Icon (Middle Left) */}
        <motion.div
          animate={{ y: [15, -15, 15], rotate: [5, -5, 5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          drag dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
          className="absolute left-[25%] top-[45%] w-12 h-12 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/30 flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:bg-cyan-950/50 transition-colors"
        >
          <Lock size={20} className="text-cyan-400" />
        </motion.div>
      </div>

      {serverError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-rose-950 border border-rose-900 text-rose-200 px-5 py-3 rounded-full flex items-center gap-3 text-sm shadow-2xl backdrop-blur-md">
          <AlertCircle size={16} />
          <span>Server Error: {serverError}</span>
        </div>
      )}

      {/* STANDARD NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 overflow-hidden rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center transition-transform group-hover:scale-105 group-hover:border-cyan-500/50 shadow-lg">
              <img src="/logo.png?v=8" alt="MafynGate" className="w-6 h-6 object-cover opacity-90 group-hover:opacity-100" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              MafynGate
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/register" className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 px-6 text-sm font-bold transition-all hover:bg-white active:scale-95 shadow-md">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - Centered Layout */}
      <main className="relative z-20 pt-48 pb-32 px-6 max-w-4xl mx-auto flex flex-col items-center text-center min-h-[90vh] justify-center">
        <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-[1.1] text-white mb-6 drop-shadow-2xl">
          Simple, secure <br className="hidden md:block" /> messaging.
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed bg-slate-950/40 p-2 rounded-xl backdrop-blur-sm">
          A real-time communication platform built for speed and privacy. No tracking, no unnecessary footprints. Just seamless chat and video.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
           <Link href="/register" className="w-full sm:w-auto px-10 py-4 rounded-2xl font-semibold text-sm transition-all bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 group border border-cyan-400/20">
             Start Chatting
             <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </Link>
           <Link href="/guide" className="w-full sm:w-auto px-10 py-4 rounded-2xl font-medium text-sm text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-all flex items-center justify-center gap-2 backdrop-blur-md">
             Documentation
           </Link>
        </div>
      </main>

      {/* FEATURES SECTION */}
      <section className="relative z-20 py-24 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-slate-800/50">
        
        <div className="mb-16 md:mb-24 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Built for the future.</h2>
          <p className="text-slate-400 text-lg">Everything you need, nothing you don't.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="rounded-3xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 hover:bg-slate-800/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 mb-6 shadow-inner">
              <Shield size={22} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Stateless Core</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Built on JWTs for fast and lightweight verification. Your sessions are securely handled without database bloat.
            </p>
          </div>
          
          <div className="rounded-3xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 hover:bg-slate-800/50 transition-colors">
             <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400 mb-6 shadow-inner">
              <Video size={22} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">HD WebRTC</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Direct peer-to-peer connections for low-latency, encrypted video calls directly from your browser.
            </p>
          </div>
          
          <div className="rounded-3xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 hover:bg-slate-800/50 transition-colors">
             <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-500 mb-6 shadow-inner">
              <Zap size={22} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Instant Sync</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time websocket connections keep your messages and statuses synced instantly across all devices.
            </p>
          </div>
        </div>
      </section>

      {/* SUPPORT SECTION */}
      <section className="relative z-20 py-24 px-6 md:px-12 bg-slate-900/30 border-t border-slate-800/50">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-white mb-4">Need Help?</h2>
            <p className="text-slate-400 text-lg max-w-md">
              Reach out to our engineering team for bug reports, questions, or general support.
            </p>
          </div>
          
          <div className="md:w-1/2 flex flex-col sm:flex-row gap-4 w-full">
            <button 
              onClick={() => window.open('https://wa.me/6282219785260', '_blank')}
              className="flex-1 rounded-2xl bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-6 text-left transition-all hover:border-emerald-500/30 group shadow-lg"
            >
              <div className="p-3 rounded-xl bg-slate-800 text-emerald-500 inline-block mb-4 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <MessageCircle size={20} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-mono mb-1 tracking-wider uppercase">WhatsApp</p>
                <p className="text-base font-semibold text-slate-200">Chat Support</p>
              </div>
            </button>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 rounded-2xl bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-6 text-left transition-all hover:border-blue-500/30 group shadow-lg"
            >
              <div className="p-3 rounded-xl bg-slate-800 text-blue-500 inline-block mb-4 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Terminal size={20} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-mono mb-1 tracking-wider uppercase">System</p>
                <p className="text-base font-semibold text-slate-200">Report Glitch</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 py-12 px-6 md:px-12 bg-slate-950 border-t border-slate-800">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-3">
            <img src="/logo.png?v=8" alt="Logo" className="w-5 h-5 opacity-50 grayscale" />
            <p>© {new Date().getFullYear()} MafynGate. All rights reserved.</p>
          </div>
          <div className="flex gap-8 font-medium">
            <Link href="/register" className="hover:text-cyan-400 transition-colors">Register</Link>
            <Link href="/login" className="hover:text-slate-300 transition-colors">Access Portal</Link>
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
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => !isSubmitting && setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-800">
                <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                  <Terminal size={16} className="text-blue-400" />
                  System Report
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isSubmitting}
                  className="text-slate-500 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-full"
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
                      <p className="text-slate-100 font-medium text-sm mb-1">Report Logged</p>
                      <p className="text-slate-500 text-xs">Our engineering team has been notified.</p>
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
                        <div className="p-3 bg-rose-950/50 border border-rose-900/50 text-rose-400 rounded-xl flex items-start gap-2 text-xs">
                          <AlertCircle size={14} className="mt-0.5 shrink-0" />
                          <p>Failed to route report. Please check your connection.</p>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Email Address</label>
                        <input 
                          required 
                          type="email" 
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          disabled={isSubmitting}
                          placeholder="user@domain.com" 
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50" 
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Error Details</label>
                        <textarea 
                          required 
                          rows="3" 
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          disabled={isSubmitting}
                          placeholder="Describe the anomaly..." 
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none disabled:opacity-50"
                        />
                      </div>
                      
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-xl text-sm transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:opacity-50 mt-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-400/20"
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
