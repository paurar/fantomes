import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const fraunces = localFont({
  src: "./fonts/fraunces.woff2",
  variable: "--font-fraunces",
  weight: "100 900",
  display: "swap",
});

const atkinson = localFont({
  src: [
    { path: "./fonts/atkinson-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/atkinson-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-atkinson",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fantômes — Débusque les abonnements que tu paies sans t’en servir",
    template: "%s · Fantômes",
  },
  description:
    "Tu paies des abonnements que tu n’utilises plus. Fantômes les trouve sur ton relevé, les classe par ce qu’ils te coûtent à l’année et prépare la lettre pour les résilier.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Fantômes",
    title: "Tu paies des abonnements que tu n’utilises plus.",
    description: "On les trouve en 2 minutes. Ton relevé ne quitte jamais ton téléphone.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f5f1e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${atkinson.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
