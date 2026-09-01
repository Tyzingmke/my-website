"use client";

import { useEffect, useMemo, useState } from "react";
import { Quote } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { nicheQuotes as defaults } from "@/data/nicheQuotes";
import styles from "@/app/niche/niche.module.css";

export function NicheQuotes() {
  const [additional, setAdditional] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const quotes = useMemo(() => [...defaults, ...additional], [additional]);
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    void supabase.from("cms_documents").select("published_body").eq("kind", "site_settings").eq("slug", "site-theme").eq("status", "published").limit(1).then(({ data }) => {
      const value = data?.[0]?.published_body?.nicheQuotes;
      if (Array.isArray(value)) setAdditional(value.filter((quote): quote is string => typeof quote === "string" && quote.trim().length > 0));
    });
  }, []);
  useEffect(() => { const timer = window.setInterval(() => setIndex((current) => (current + 1) % quotes.length), 5200); return () => window.clearInterval(timer); }, [quotes.length]);
  return <section className={styles.quotes} aria-labelledby="quotes-title"><div><p>Love notes / rotating collection</p><h1 id="quotes-title">Words that arrive softly.</h1><span>Fifty small notes, with room for more from the private settings.</span></div><article key={quotes[index]} className={styles.quoteCard}><Quote aria-hidden="true" /><p>{quotes[index]}</p><small>{String(index + 1).padStart(2, "0")} / {String(quotes.length).padStart(2, "0")}</small></article></section>;
}
