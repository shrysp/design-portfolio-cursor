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
  title: "Shreyas Patil | Product Designer",
  description: "Shreyas is a product designer with a passion for creating user-friendly and intuitive designs.",
  keywords: ["portfolio", "design", "Shreyas Patil", "Product Designer", "next.js", "tailwind css", "framer motion", "web development"],
  authors: [{ name: "Shreyas Patil" }],
  creator: "Shreyas Patil",
  icons: {
    icon: "/Favicon.png",
  },
  openGraph: {
    title: "Shreyas Patil | Product Designer",
    description: "Shreyas is a product designer with a passion for creating user-friendly and intuitive designs.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shreyas Patil - Product Designer Portfolio"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Shreyas Patil | Product Designer",
    description: "Shreyas is a product designer with a passion for creating user-friendly and intuitive designs.",
    images: ["/og-image.png"],
    creator: "@ShreyasPatil_"
  }
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