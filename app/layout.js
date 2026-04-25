import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://mafyngate.web.id'),
  title: "MafynGate - Secure Social Messaging & Private Communication",
  description: "MafynGate adalah platform pesan instan paling aman dengan enkripsi end-to-end. Nikmati chat pribadi, video call HD, dan notifikasi pintar dalam satu aplikasi PWA yang ringan dan cepat.",
  keywords: "mafyn, mafyn gate, mafyngate, secure messaging, private chat, encrypted chat, real-time communication, secure video call, privacy focused app, anonymous chat, end-to-end encryption, PWA messaging, messaging app 2024, alternative whatsapp aman, platform komunikasi privat, secure gateway, messenger aman indonesia",
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png?v=8', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=8', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json'
};

import { Providers } from "../components/Providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        {/* iOS PWA Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MafynGate" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
