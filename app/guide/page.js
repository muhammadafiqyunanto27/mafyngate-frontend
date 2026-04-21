'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  UserPlus, 
  MessageSquare, 
  Video, 
  Bell, 
  Settings, 
  CheckCircle2,
  Lock,
  Zap,
  Globe,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const content = {
  EN: {
    hero: "User Guide",
    subtitle: "Complete system walkthrough and operational procedures for MafynGate.",
    badge: "Official Documentation",
    cta: "Access Portal",
    ctaSub: "Initialization of private gateway is ready. Proceed to terminal.",
    ready: "READY FOR LAUNCH",
    steps: [
      { id: "01", title: "Join the Gateway", desc: "Create an account and login to the secure MafynGate portal using your email." },
      { id: "02", title: "Build Connections", desc: "Search for users. Follow them to start a connection. Once they follow back, you're ready." },
      { id: "03", title: "Start Messaging", desc: "Enter the Messages dashboard to start real-time private chats with mutual followers." },
      { id: "04", title: "High-Fidelity Calls", desc: "Start a Video Call. Use advanced features like Mirror mode and Switch Camera." },
      { id: "05", title: "Real-time Alerts", desc: "Receive instant sound notifications for new messages and follows, perfectly synced." },
      { id: "06", title: "Pro Tools & Settings", desc: "Utilize the technical calculator and Todo list. Customize profile and security." }
    ]
  },
  ID: {
    hero: "Panduan Pengguna",
    subtitle: "Panduan lengkap sistem dan prosedur operasional untuk MafynGate.",
    badge: "Dokumentasi Resmi",
    cta: "Masuk Portal",
    ctaSub: "Inisialisasi gateway pribadi telah siap. Lanjutkan ke terminal.",
    ready: "SIAP BEROPERASI",
    steps: [
      { id: "01", title: "Masuk ke Gateway", desc: "Buat akun dan login ke portal aman MafynGate menggunakan email Anda." },
      { id: "02", title: "Bangun Koneksi", desc: "Cari pengguna. Follow mereka untuk memulai koneksi. Setelah follow mutual, Anda siap." },
      { id: "03", title: "Mulai Chatting", desc: "Masuk ke dashboard Pesan untuk obrolan pribadi real-time dengan follower mutual." },
      { id: "04", title: "Panggilan Video HD", desc: "Mulai Panggilan Video. Gunakan fitur canggih seperti mode Mirror dan Ganti Kamera." },
      { id: "05", title: "Notifikasi Real-time", desc: "Terima notifikasi suara instan untuk pesan dan follow baru, sinkron sempurna." },
      { id: "06", title: "Alat Pro & Pengaturan", desc: "Gunakan kalkulator teknis bawaan dan daftar tugas. Sesuaikan profil dan keamanan." }
    ]
  }
};

const icons = [ShieldCheck, UserPlus, MessageSquare, Video, Bell, Settings];
const colors = ["text-primary", "text-indigo-500", "text-emerald-500", "text-rose-500", "text-amber-500", "text-slate-500"];
const bgs = ["bg-primary/10", "bg-indigo-500/10", "bg-emerald-500/10", "bg-rose-500/10", "bg-amber-500/10", "bg-slate-500/10"];

export default function GuidePage() {
  const [lang, setLang] = useState('EN');
  const t = content[lang];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 pb-10 overflow-x-hidden">
      
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 -left-10 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-0 -right-10 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse animation-delay-2000"></div>
      </div>

      {/* Navbar (Landing DNA) */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group text-muted-foreground hover:text-foreground transition-all">
            <ArrowLeft size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Back</span>
          </Link>
          
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 overflow-hidden shadow-lg shadow-primary/20 flex-shrink-0">
               <img src="/logo.png?v=8" alt="MafynGate" className="w-full h-full object-cover" />
             </div>
             <span className="text-xl font-black tracking-tighter text-foreground uppercase">{t.hero}</span>
          </div>

          <button 
            onClick={() => setLang(lang === 'EN' ? 'ID' : 'EN')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-all active:scale-95 border border-white/5"
          >
            <Globe size={14} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">{lang}</span>
          </button>
        </div>
      </nav>

      {/* Header */}
      <header className="pt-28 pb-10 px-6 text-center max-w-4xl mx-auto space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20"
        >
          <Lock size={12} className="fill-current" />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">{t.badge}</span>
        </motion.div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-foreground uppercase">
          MASTERING <span className="text-primary italic">THE PORTAL</span>
        </h1>
        
        <p className="text-sm text-muted-foreground font-medium max-w-xl mx-auto opacity-80">
          {t.subtitle}
        </p>
      </header>

      {/* Grid Guide (1 Row 2 Boxes) */}
      <section className="px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="wait">
            {t.steps.map((step, idx) => {
              const Icon = icons[idx];
              return (
                <motion.div 
                  key={`${lang}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 rounded-[2.5rem] bg-card/60 backdrop-blur-sm border border-white/5 hover:border-primary/40 transition-all flex items-start gap-6 group relative overflow-hidden"
                >
                  <div className={`w-14 h-14 rounded-2xl ${bgs[idx]} ${colors[idx]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform relative z-10`}>
                    <Icon size={28} />
                  </div>
                  
                  <div className="space-y-2 relative z-10 flex-1">
                    <div className="text-primary text-[10px] font-bold uppercase tracking-widest">STEP {step.id}</div>
                    <h2 className="text-xl font-black tracking-tighter text-foreground uppercase group-hover:text-primary transition-colors">
                      {step.title}
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed opacity-80">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA (Ready for launch - Blue themed) */}
      <section className="mt-12 px-6">
        <div className="max-w-5xl mx-auto p-12 md:p-16 rounded-[4rem] bg-primary text-primary-foreground text-center space-y-10 shadow-2xl shadow-primary/30 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          
          <Zap size={64} className="mx-auto text-primary-foreground/40" />
          <div className="space-y-2">
             <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">{t.ready}</h2>
             <p className="text-[10px] md:text-xs font-bold opacity-80 max-w-sm mx-auto tracking-widest uppercase">{t.ctaSub}</p>
          </div>
          
          <div className="pt-2 relative z-10">
            <Link href="/register" className="inline-flex h-14 px-12 rounded-2xl bg-white text-primary font-black text-xs items-center hover:scale-110 active:scale-95 transition-all uppercase tracking-widest shadow-xl">
              {t.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer (Same as Landing Page) */}
      <footer className="mt-12 py-4 border-t border-white/5 bg-background">
        <div className="max-w-7xl mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Brand */}
          <div className="flex items-center gap-2 group">
            <div className="w-6 h-6 overflow-hidden flex-shrink-0">
              <img src="/logo.png?v=8" alt="MafynGate" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground select-none">MafynGate</span>
          </div>

          {/* Center: Copyright */}
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-40 text-muted-foreground text-center">
            © 2026 muhammad afiq yunanto alright reserved
          </p>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
            <Link href="/register" className="text-muted-foreground hover:text-primary transition-all">Register</Link>
            <Link href="/login" className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all tracking-[0.2em]">Access Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
