"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const consentCookie = "antony_cookie_consent";
const visitorKey = "tony-analytics-visitor";

function hasAnalyticsConsent() {
  return document.cookie.split(";").some((entry) => entry.trim() === `${consentCookie}=all`);
}

function visitorId() {
  const existing = localStorage.getItem(visitorKey);
  if (existing) return existing;
  const next = crypto.randomUUID();
  localStorage.setItem(visitorKey, next);
  return next;
}

export function SiteAnalytics() {
  const pathname = usePathname();
  const lastTracked = useRef("");

  useEffect(() => {
    const track = async () => {
      if (!pathname || pathname.startsWith("/admin") || !hasAnalyticsConsent()) return;
      const key = `${pathname}:${performance.getEntriesByType("navigation").length}`;
      if (key === lastTracked.current) return;
      lastTracked.current = key;
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      await supabase.functions.invoke("public-events", { body: {
        pagePath: pathname.replace(/\/$/, "") || "/",
        visitorId: visitorId(),
      } });
    };

    void track();
    const onConsent = () => void track();
    window.addEventListener("cookie-consent-change", onConsent);
    return () => window.removeEventListener("cookie-consent-change", onConsent);
  }, [pathname]);

  return null;
}
