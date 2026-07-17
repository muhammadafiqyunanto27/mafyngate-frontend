# Component & Layout Architecture

Setiap kali membuat UI, pecah menjadi komponen kecil di folder `/components`.

## Daftar Komponen Utama yang Dibutuhkan:
1.  **Navbar (`/components/Navbar.jsx`)**
    *   Kiri: Logo MafynGate + Teks (Primary).
    *   Kanan: Link `LOGIN` (Text Muted, hover putih) dan Button `JOIN` (Solid Primary Color, rounded-lg).
2.  **Hero Section (`/components/Hero.jsx`)**
    *   Headline raksasa di tengah. Kata "Communication" menggunakan warna `text-primary` (#8B5CF6).
    *   Sub-headline di bawahnya dengan warna `text-muted` maksimal lebar max-w-2xl agar tidak terlalu memanjang ke samping.
    *   CTA Buttons: "Get Started" (Solid Primary) dan "User Guide" / "Support" (Secondary).
3.  **Feature Cards (`/components/FeatureGrid.jsx`)**
    *   Grid layout (1 kolom di mobile, 3 kolom di desktop).
    *   Setiap Card menggunakan background `surface` (#18181B) dan border `surface-border`.
    *   Ikon di dalam card HARUS menggunakan warna `text-primary` agar terlihat menyala (jangan warna gelap!).
4.  **Support Section (`/components/Support.jsx`)**
    *   Heading H2 murni (jangan pakai italic tebal yang terlihat jadul).
    *   Card WhatsApp: Ikon WA harus warna `text-green-500` (#22C55E) agar stand-out.
5.  **Footer (`/components/Footer.jsx`)**
    *   Garis tipis di atas footer.
    *   Teks copyright: "© 2026 Muhammad Afiq Yunanto. All rights reserved." (Perbaiki typo 'Alright').
