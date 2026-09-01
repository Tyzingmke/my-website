"use client";

import { usePathname } from "next/navigation";
import { CookieConsent } from "@/components/CookieConsent";
import { FirstLoadScreen } from "@/components/FirstLoadScreen";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import { PageTransition } from "@/components/PageTransition";
import { ScrollExperience } from "@/components/ScrollExperience";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { SiteTheme } from "@/components/SiteTheme";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isPrivatePage = pathname?.startsWith("/niche");

  if (isAdmin || isPrivatePage) {
    return <main id="main-content">{children}</main>;
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <FirstLoadScreen />
      <PageTransition />
      <MotionProvider />
      <ScrollExperience />
      <SiteAnalytics />
      <SiteTheme />
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <CookieConsent />
    </>
  );
}
