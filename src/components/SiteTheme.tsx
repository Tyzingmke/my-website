"use client";

import { useEffect } from "react";
import type { CmsDocument } from "@/lib/cms/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const storageKey = "antony-theme";

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#1d1e2c" : "#f4ecd6");
  window.dispatchEvent(new CustomEvent("site-theme-change", { detail: { theme } }));
}

export function SiteTheme() {
  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    void supabase
      .from("cms_documents")
      .select("id, workspace_id, kind, slug, title, status, schema_version, draft_body, published_body, version, updated_at, published_at")
      .eq("kind", "site_settings")
      .eq("status", "published")
      .limit(1)
      .then(({ data }) => {
        if (cancelled) return;
        try {
          if (localStorage.getItem(storageKey)) return;
        } catch {
          // Use the published default when browser storage is unavailable.
        }
        const settings = data?.[0] as CmsDocument | undefined;
        const body = settings?.published_body ?? settings?.draft_body;
        const theme = body?.theme === "dark" ? "dark" : body?.theme === "light" ? "light" : null;
        if (theme) applyTheme(theme);
      });

    return () => { cancelled = true; };
  }, []);

  return null;
}
