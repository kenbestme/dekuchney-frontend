import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatWidgets from './components/ChatWidgets';   // ✅ floating chat buttons (WhatsApp + Telegram)

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'De Kuchney Villa',
  description: 'Experience Unrivaled Elegance & Luxury',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' }
    ],
    shortcut: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Paystack inline script – loads globally for all pages */}
        <Script 
          src="https://js.paystack.co/v2/inline.js" 
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${inter.className} bg-neutral-50 flex flex-col min-h-screen`} suppressHydrationWarning>
        <Navbar />
        <div className="pt-24 flex-grow">
          {children}
        </div>
        <Footer />
        <ChatWidgets />   {/* ✅ WhatsApp & Telegram floating buttons (admin‑controlled) */}
      </body>
    </html>
  );
}