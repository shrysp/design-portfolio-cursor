import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Design Portfolio | Next.js, Tailwind CSS v4, Framer Motion",
  description: "A modern design portfolio showcasing projects built with Next.js, Tailwind CSS v4, and Framer Motion",
  keywords: ["portfolio", "design", "next.js", "tailwind css", "framer motion", "web development"],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-zinc-900`}
      >
        {children}
        {/* Navigation */}
        <div className="fixed flex items-center justify-center mx-auto left-1/2 -translate-x-1/2 bottom-8 z-10">
            <Navbar />
          </div>  
      </body>
    </html>
  );
}
