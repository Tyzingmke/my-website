import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { profile } from "@/data/site";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import { PageTransition } from "@/components/PageTransition";
import { CookieConsent } from "@/components/CookieConsent";
import { ScrollExperience } from "@/components/ScrollExperience";

const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
  referrer: "strict-origin-when-cross-origin",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: `${profile.name} | Website Designer & Developer`,
    description: profile.summary,
    siteName: profile.brand,
    images: [{ url: `${basePath}/images/antony-studio.webp`, width: 941, height: 1672, alt: profile.name }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4ecd6" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1e2c" },
  ],
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
    <html lang="en" data-motion="pending" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var stored=localStorage.getItem("antony-theme");var theme=stored==="dark"||stored==="light"?stored:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",theme);document.documentElement.style.colorScheme=theme;}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${sora.variable}`}>
        <noscript>
          <style>{`.intro-greeting,[data-hero-image="soft"]{display:none!important}.site-header-home{opacity:1!important;visibility:visible!important}`}</style>
        </noscript>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <PageTransition />
        <MotionProvider />
        <ScrollExperience />
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <CookieConsent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </body>
    </html>
  );
}
