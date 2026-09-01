"use client";

import { FormEvent, ReactNode, createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Heart, LockKeyhole, Moon, Sun } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ThreePetalField } from "@/components/ThreePetalField";
import styles from "@/app/niche/niche.module.css";

const tokenKey = "tony-consults-niche-access";
const NicheAccessContext = createContext<string>("");

export const useNicheAccessToken = () => useContext(NicheAccessContext);

export function NicheAccess({ children }: { children: ReactNode }) {
  const [answer, setAnswer] = useState("");
  const [token, setToken] = useState("");
  const [question, setQuestion] = useState("What is my reference to you?");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setToken(window.localStorage.getItem(tokenKey) ?? "");
    setTheme(window.localStorage.getItem("tony-consults-niche-theme") === "light" ? "light" : "dark");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    void supabase.from("cms_documents").select("published_body").eq("kind", "site_settings").eq("slug", "site-theme").eq("status", "published").limit(1).then(({ data }) => {
      const value = data?.[0]?.published_body?.nicheQuestion;
      if (typeof value === "string" && value.trim()) setQuestion(value.trim());
    });
  }, []);

  const chooseTheme = (nextTheme: "dark" | "light") => {
    setTheme(nextTheme);
    window.localStorage.setItem("tony-consults-niche-theme", nextTheme);
  };

  const unlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !answer.trim()) return;
    const { data, error: unlockError } = await supabase.functions.invoke("niche-unlock", { body: { answer } });
    if (!unlockError && data?.ok && typeof data.token === "string") {
      window.localStorage.setItem(tokenKey, data.token);
      setToken(data.token);
      setError("");
      return;
    }
    setError(unlockError?.message ?? data?.error ?? "That answer did not unlock this space.");
  };

  return <main className={styles.page} data-niche-theme={theme}>
    <ThreePetalField />
    <button className={styles.themeToggle} type="button" onClick={() => chooseTheme(theme === "dark" ? "light" : "dark")} aria-label={`Use ${theme === "dark" ? "light" : "dark"} theme`}>
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
    {!token ? <section className={styles.lockScreen} aria-labelledby="niche-lock-title">
      <div className={styles.lockCard}>
        <img src="/niche/rose-bouquet.png" alt="Pink roses" />
        <div className={styles.lockCopy}>
          <p><Heart size={15} fill="currentColor" /> Private space</p>
          <h1 id="niche-lock-title">Enter quietly.</h1>
          <span>A password-gated collection of messages, notes, and moments.</span>
          <form onSubmit={unlock}>
            <label htmlFor="niche-answer">{question}</label>
            <div><input id="niche-answer" autoComplete="off" autoFocus value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Your answer" /><button type="submit" aria-label="Unlock"><LockKeyhole size={18} /></button></div>
            <small role="status">{error || "Enter the answer to continue."}</small>
          </form>
        </div>
      </div>
    </section> : <>
      <nav className={styles.privateNav} aria-label="Private pages">
        <Link href="/niche/">Home</Link><Link href="/niche/chat/">Messenger</Link><Link href="/niche/private/">Private room</Link><Link href="/niche/notes/">Love notes</Link><Link href="/niche/play/">Play</Link>
      </nav>
      <NicheAccessContext.Provider value={token}>{children}</NicheAccessContext.Provider>
    </>}
  </main>;
}
