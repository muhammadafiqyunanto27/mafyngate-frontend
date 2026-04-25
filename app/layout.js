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
  metadataBase: new URL('https://mafyngate.com'),
  title: "MafynGate - Secure Social Messaging",
  description: "MafynGate: Aplikasi pesan instan paling aman dengan enkripsi tingkat tinggi untuk chat, telepon, dan video call pribadi.",
  keywords: "mafyn, mafyn gate, mafyngate, secure messaging, private chat, encrypted chat, real-time communication, secure video call, privacy focused app",
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.png?v=8',
    apple: '/apple-touch-icon.png?v=8',
    shortcut: '/favicon.ico?v=8'
  }
};

import { Providers } from "../components/Providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
