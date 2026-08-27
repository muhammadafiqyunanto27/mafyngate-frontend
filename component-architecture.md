# Component Architecture (Premium Minimalist SaaS Edition)

Setiap UI didesain agar terlihat premium, minimalis, dan seimbang.

1.  **Navbar (`/components/Navbar.jsx`)**
    *   Kiri: Logo & Nama Sistem.
    *   Kanan: Tombol `LOGIN` (muted text, hover putih) dan `JOIN` (solid `bg-violet-600` hover `bg-violet-700`, rounded-lg).
2.  **Hero Section (`/components/Hero.jsx`)**
    *   Teks "Communication" wajib menggunakan text-gradient `bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-500` tanpa efek glow.
    *   Tombol "Get Started" (Solid Violet, `bg-violet-600` hover `bg-violet-700`).
    *   Tombol "User Guide" & "Support" (Muted background `bg-zinc-900/50` or `bg-zinc-800/30`, tipis `border border-zinc-800`).
3.  **Feature Grid (`/components/FeatureGrid.jsx`)**
    *   3 Card minimalis dengan background `bg-zinc-900/30` dan border `border-zinc-800` / `border-white/5`.
    *   Ikon Lucide berdiri sendiri tanpa container boks, menggunakan warna `text-violet-400` atau `text-zinc-400`.
4.  **Support Section (`/components/Support.jsx`)**
    *   Heading "CONNECT SUPPORT" dalam huruf Kapital tebal biasa (DILARANG italic), tracking lebar.
    *   Ikon WhatsApp berwarna hijau `text-green-500` / `text-emerald-400`, biarkan ikon berdiri sendiri dan membesar sedikit saat di-hover.
5.  **Footer (`/components/Footer.jsx`)**
    *   Copyright text: "© 2026 Muhammad Afiq Yunanto. All rights reserved." (Perbaiki ejaan).
