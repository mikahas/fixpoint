import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "fixpoint",
  description: "Home maintenance tracking system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-950 text-zinc-100 flex flex-col">
        <header className="border-b border-zinc-900 px-6 py-4">
          <Link
            href="/"
            className="font-mono text-zinc-400 hover:text-zinc-100 transition-colors text-sm tracking-widest uppercase"
          >
            fixpoint
          </Link>
        </header>
        <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
