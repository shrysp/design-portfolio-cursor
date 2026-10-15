import type { Metadata } from "next";
import { Geist, Indie_Flower } from "next/font/google";
import "./globals.css";
import StickyFooter from "@/components/StickyFooter";
import MotionProvider from "@/components/MotionProvider";
import DevFeedback from "@/components/DevFeedback";
import RouteTransitionSettler from "@/components/RouteTransitionSettler";
import EntranceHost from "@/components/cameo/entrance/EntranceHost";
import "dialkit/styles.css";
import { DialRoot } from "dialkit";


const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// The journal's handwriting
const indieFlower = Indie_Flower({
  variable: "--font-handwriting",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Where the site lives, so share previews can point at full image addresses.
// Vercel supplies the production domain; set NEXT_PUBLIC_SITE_URL to override it.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // A page that names itself ("Quinn") gets the name appended
  title: { default: "Shreyas Patil | Product Designer", template: "%s | Shreyas Patil" },
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
        className={`${geist.variable} ${indieFlower.variable} antialiased bg-stone-50 text-stone-900 overflow-x-clip`}
      >
        <DevFeedback />
        <RouteTransitionSettler />
        <MotionProvider>
          {/* The way into the PIP tour, from any page: its takeover, glass and toast. */}
          <EntranceHost>{children}</EntranceHost>
          <StickyFooter />
        </MotionProvider>
        {/* The tuning panel: for building with, never for visitors. */}
        {process.env.NODE_ENV !== 'production' && <DialRoot defaultOpen={false} position="bottom-right" />}

      </body>
    </html>
  );
}