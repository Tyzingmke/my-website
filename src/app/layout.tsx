import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { profile } from "@/data/site";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import { PageTransition } from "@/components/PageTransition";

const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3030"),
  title: {
    default: `${profile.name} | Website Designer & Developer`,
    template: `%s | ${profile.name}`,
  },
  description: profile.summary,
  keywords: ["website designer Kenya", "Next.js developer", "GitHub Pages websites", "business website designer", "Antony Mburu"],
  authors: [{ name: profile.name }],
  creator: profile.name,
  category: "Web design and development",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: `${profile.name} | Website Designer & Developer`,
    description: profile.summary,
    siteName: profile.brand,
    images: [{ url: "/images/antony-studio.png", width: 941, height: 1672, alt: profile.name }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#11130f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    email: profile.email,
    address: { "@type": "PostalAddress", addressCountry: "KE" },
  };

  return (
    <html lang="en" data-motion="pending">
      <body className={`${inter.variable} ${sora.variable}`}>
        <noscript>
          <style>{`.intro-greeting,[data-hero-image="soft"]{display:none!important}.site-header-home{opacity:1!important;visibility:visible!important}`}</style>
        </noscript>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <PageTransition />
        <MotionProvider />
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </body>
    </html>
  );
}
