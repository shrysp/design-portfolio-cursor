import type { Metadata } from "next";
import { Geist, Kalam } from "next/font/google";
import "./globals.css";
import StickyFooter from "@/components/StickyFooter";
import MotionProvider from "@/components/MotionProvider";
import DevFeedback from "@/components/DevFeedback";
import RouteTransitionSettler from "@/components/RouteTransitionSettler";
import EntranceHost from "@/components/cameo/entrance/EntranceHost";
import "dialkit/styles.css";
import { DialRoot } from "dialkit";
import { HOME_PREVIEW, SITE_URL, homeImage, previewVideo } from "@/lib/linkPreview";


const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// The journal's handwriting
const kalam = Kalam({
  variable: "--font-handwriting",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    images: [homeImage()],
    // The same scene, moving, where the app plays video (linkPreview.ts)
    videos: previewVideo(HOME_PREVIEW),
  },
  twitter: {
    card: "summary_large_image",
    title: "Shreyas Patil | Product Designer",
    description: "Shreyas is a product designer with a passion for creating user-friendly and intuitive designs.",
    images: [homeImage().url],
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
        className={`${geist.variable} ${kalam.variable} antialiased bg-stone-50 text-stone-900 overflow-x-clip`}
      >
        <DevFeedback />
        <RouteTransitionSettler />
        <MotionProvider>
          {/* The way into the PIP tour, from any page: its takeover and glass, and PIP in the dock. */}
          <EntranceHost dock={<StickyFooter />}>{children}</EntranceHost>
        </MotionProvider>
        {/* The tuning panel: for building with, never for visitors. */}
        {process.env.NODE_ENV !== 'production' && <DialRoot defaultOpen={false} position="bottom-right" />}

      </body>
    </html>
  );
}