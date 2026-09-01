"use client";

import { FormEvent, useEffect, useState } from "react";
import Script from "next/script";
import { ArrowDown, Heart, LockKeyhole, Sparkles } from "lucide-react";
import styles from "./niche.module.css";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ThreePetalField } from "@/components/ThreePetalField";
import { NicheChat } from "@/components/NicheChat";

export default function NichePage() {
  const [answer, setAnswer] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("What’s my reference to you?");
  const [chatToken, setChatToken] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    void supabase.from("cms_documents").select("published_body").eq("kind", "site_settings").eq("slug", "site-theme").eq("status", "published").limit(1).then(({ data }) => {
      const value = data?.[0]?.published_body?.nicheQuestion;
      if (typeof value === "string" && value.trim()) setQuestion(value.trim());
    });
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    return () => script.remove();
  }, [unlocked]);

  const unlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !answer.trim()) return;
    const { data, error: unlockError } = await supabase.functions.invoke("niche-unlock", { body: { answer } });
    if (!unlockError && data?.ok && typeof data.token === "string") {
      setUnlocked(true);
      setChatToken(data.token);
      setError("");
      return;
    }
    setError(unlockError?.message ?? data?.error ?? "A little closer. The answer is one word.");
  };

  return <main className={styles.page}>
    <ThreePetalField />
    {!unlocked ? <section className={styles.lockScreen} aria-labelledby="niche-lock-title">
      <div className={styles.lockCard}>
        <img src="/niche/rose-bouquet.png" alt="Pink roses" />
        <div className={styles.lockCopy}>
          <p><Sparkles size={15} /> A small corner of the internet</p>
          <h1 id="niche-lock-title">For Ann Wanjiru.</h1>
          <span>Known here as Niche.</span>
          <form onSubmit={unlock}>
            <label htmlFor="niche-answer">{question}</label>
            <div><input id="niche-answer" autoComplete="off" autoFocus value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Your answer" /><button type="submit" aria-label="Unlock"><LockKeyhole size={18} /></button></div>
            {error ? <small role="status">{error}</small> : <small>One word unlocks this page.</small>}
          </form>
        </div>
      </div>
    </section> : <>
      <Script src="https://www.tiktok.com/embed.js" strategy="afterInteractive" />
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p><Heart size={15} fill="currentColor" /> private notes for Niche</p>
          <h1>A few things<br />I look up to.</h1>
          <span>For Ann Wanjiru, with a little softness and a lot of admiration.</span>
          <a href="#moments">See the moments <ArrowDown size={17} /></a>
        </div>
        <img className={styles.roseHero} src="/niche/rose-bouquet.png" alt="A bouquet of pale pink roses" />
      </section>

      <section className={styles.note}>
        <p>Some people make ordinary moments feel like a scene worth keeping. This is a small collection of the energy, style, and stories that make me want to create something thoughtful for you.</p>
      </section>

      <section className={styles.creator} id="moments" aria-labelledby="creator-title">
        <div><p>01 / her world</p><h2 id="creator-title">The videos behind the mood.</h2><span>This official creator feed updates directly from Niche&apos;s TikTok account.</span></div>
        <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@_n.i.c.h.e_" data-unique-id="_n.i.c.h.e_" data-embed-type="creator" style={{ maxWidth: 780, minWidth: 288 }}><section><a target="_blank" href="https://www.tiktok.com/@_n.i.c.h.e_?refer=creator_embed" rel="noreferrer">@_n.i.c.h.e_</a></section></blockquote>
      </section>

      {chatToken ? <NicheChat token={chatToken} /> : null}

      <footer className={styles.footer}><img src="/niche/rose-bouquet.png" alt="" /><p>Made quietly, for Niche.</p></footer>
    </>}
  </main>;
}
