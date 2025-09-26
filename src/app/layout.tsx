import type { Metadata } from "next";
import { Inter, Source_Serif_4, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
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
    <html lang="en" className="scroll-smooth overflow-x-clip">
      <body
        className={`${inter.variable} ${geistMono.variable} ${sourceSerif4.variable} antialiased bg-stone-50 text-stone-900`}
      >
        {children}
        {/* Navigation */}
        <div className="fixed flex items-center justify-center mx-auto left-1/2 -translate-x-1/2 bottom-8 z-10">
          <Navigation />
        </div>
      </body>
    </html>
  );
}