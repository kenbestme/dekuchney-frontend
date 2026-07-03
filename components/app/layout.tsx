import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "De Kuchney Villa Hotel | Luxury Stays",
  description: "Experience unparalleled luxury and comfort at De Kuchney Villa Hotel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-neutral-50`}>
        <Navbar />
        {/* We add padding top so the fixed Navbar doesn't cover the top of the pages */}
        <div className="pt-24">
          {children}
        </div>
      </body>
    </html>
  );
}