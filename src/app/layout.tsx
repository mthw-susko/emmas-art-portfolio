import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Emma - Artist Portfolio",
  description: "Emma's artist portfolio showcasing her creative work",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-gradient-to-br from-white via-blue-100 to-blue-200" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground font-sans leading-relaxed transition-all-smooth`}
      >
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="text-center py-8 text-blue-500 text-sm">
          ALL ARTWORK AND PHOTOGRAPHS © EMMA 2024-2025
        </footer>
      </body>
    </html>
  );
}