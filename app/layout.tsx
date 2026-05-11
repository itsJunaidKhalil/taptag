import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import Toaster from "@/components/ui/Toaster";
import "./../styles/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

// Resolve the canonical site URL. Falls back to the Vercel-provided
// production URL when NEXT_PUBLIC_APP_URL isn't configured, which avoids
// the failure mode where every og:image / canonical / sitemap entry points
// to the wrong host and share previews silently break.
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  const vercelProd = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL;
  const raw =
    explicit ||
    (vercelProd ? `https://${vercelProd}` : "") ||
    (vercel ? `https://${vercel}` : "") ||
    "https://taptag.biz";
  return raw.replace(/\/+$/, "");
}

const SITE_URL = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TapTag — Your digital business card",
    template: "%s | TapTag",
  },
  description:
    "Create a beautiful digital business card. Share all your links, social profiles and contact info from one branded URL. Pair it with an NFC tag for instant tap-to-share.",
  keywords: [
    "digital business card",
    "nfc business card",
    "linktree alternative",
    "bio link",
    "vCard",
    "TapTag",
  ],
  applicationName: "TapTag",
  authors: [{ name: "TapTag" }],
  openGraph: {
    type: "website",
    siteName: "TapTag",
    title: "TapTag — Your digital business card",
    description:
      "Share all your links, contacts and socials from one branded URL. Modern, minimal and built for NFC.",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TapTag — Your digital business card",
    description: "Share all your links, contacts and socials from one branded URL.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
