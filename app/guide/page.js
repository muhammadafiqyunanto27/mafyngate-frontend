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
const colors = ["text-cyan-400", "text-cyan-400", "text-cyan-400", "text-cyan-400", "text-cyan-400", "text-cyan-400"];
const bgs = ["bg-cyan-500/10", "bg-cyan-500/10", "bg-cyan-500/10", "bg-cyan-500/10", "bg-cyan-500/10", "bg-cyan-500/10"];

export default function GuidePage() {
  const [lang, setLang] = useState('EN');
  const t = content[lang];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 pb-10 overflow-x-hidden">
      
      {/* Clean background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Navbar (Landing DNA) */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border h-16 flex items-center">
        <div className="max-w-5xl mx-auto px-6 w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm hidden sm:inline">Back</span>
          </Link>
          
          <div className="flex items-center gap-2">
             <div className="w-7 h-7 overflow-hidden rounded-lg border border-border flex-shrink-0">
               <img src="/logo.png?v=8" alt="MafynGate" className="w-full h-full object-cover" />
             </div>
             <span className="text-base font-semibold tracking-tight text-foreground">{t.hero}</span>
          </div>

          <button 
            onClick={() => setLang(lang === 'EN' ? 'ID' : 'EN')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors border border-border text-sm"
          >
            <Globe size={14} className="text-muted-foreground" />
            <span className="text-xs font-medium uppercase">{lang}</span>
          </button>
        </div>
      </nav>

      {/* Header */}
      <header className="pt-24 pb-12 px-6 text-center max-w-3xl mx-auto space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium"
        >
          <Lock size={12} />
          <span>{t.badge}</span>
        </motion.div>
        
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight text-foreground">
          {t.hero}
        </h1>
        
        <p className="text-base text-muted-foreground max-w-xl mx-auto">
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
                  className="p-6 rounded-xl bg-card/60 backdrop-blur-sm border border-white/5 hover:border-primary/40 transition-all flex items-start gap-6 group relative overflow-hidden"
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
        <div className="max-w-3xl mx-auto p-10 md:p-14 rounded-2xl bg-primary text-primary-foreground text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <Zap size={40} className="mx-auto text-primary-foreground/50" />
          <div className="space-y-2 relative z-10">
             <h2 className="text-2xl md:text-4xl font-bold tracking-tight">{t.ready}</h2>
             <p className="text-sm opacity-80 max-w-sm mx-auto">{t.ctaSub}</p>
          </div>
          
          <div className="relative z-10">
            <Link href="/register" className="inline-flex h-11 px-8 rounded-lg bg-white text-primary font-medium text-sm items-center transition-colors hover:bg-white/90">
              {t.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer (Same as Landing Page) */}
      <footer className="mt-12 py-8 border-t border-border">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 overflow-hidden rounded flex-shrink-0">
              <img src="/logo.png?v=8" alt="MafynGate" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-semibold text-foreground">MafynGate</span>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MafynGate. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-sm">
            <Link href="/register" className="text-muted-foreground hover:text-foreground transition-colors">Register</Link>
            <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
