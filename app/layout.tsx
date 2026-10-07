import type React from "react";
import "./globals.css";
import { Inter, Manrope, Newsreader } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  // next/font ships no fallback metrics for Newsreader; skip the size-adjust step.
  adjustFontFallback: false,
});

// Admin (CMS) faces: Inter for the UI, Geist for the login branding panel.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geist = GeistSans;
const geistMono = GeistMono;

const description =
  "Pioneering open-source AI diagnostics designed for and with frontline health workers in underserved communities across Africa and globally.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://codetherapy.ml"),
  title: "CodeTherapy",
  description,
  openGraph: {
    title: "CodeTherapy",
    description,
    siteName: "CodeTherapy",
    type: "website",
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: "CodeTherapy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeTherapy",
    description,
    images: ["/brand/og.png"],
  },
};

/** The logo cyan — tints the browser chrome on mobile. */
export const viewport = { themeColor: "#00aeef" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${newsreader.variable} ${inter.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <head>
        {/*
          Opt in to scroll reveals before first paint. Runs only when JS is
          available and the visitor has not asked for reduced motion — so the
          hidden start states in globals.css can never strand content.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("js-reveal")}}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-cream font-sans text-ink antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
