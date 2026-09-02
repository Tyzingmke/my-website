"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, KeyRound, Mail, Orbit } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "../us/universe.module.css";

export default function HiddenEntryPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function signIn(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage("Private access is not configured yet."); setBusy(false); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message); else router.replace("/us");
    setBusy(false);
  }
  async function sendLink() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !email) { setMessage("Enter the approved email address first."); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/us` } });
    setMessage(error ? error.message : "A secure sign-in link has been sent."); setBusy(false);
  }
  return <main className={`${styles.universe} ${styles.entry}`}>
    <div className={styles.entryAura} />
    <section className={styles.entryCard} aria-labelledby="private-access-title">
      <div className={styles.eyebrow}><Orbit size={16} /> Private access</div>
      <h1 id="private-access-title">A small world,<br />kept between two people.</h1>
      <p>This is a private, account-based space. There are no clues, shared passcodes, or public entries.</p>
      <form onSubmit={signIn} className={styles.entryForm}>
        <label><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
        <label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your private password" autoComplete="current-password" required /></label>
        {message && <p className={styles.formMessage} role="status">{message}</p>}
        <button className={styles.primaryButton} disabled={busy}><KeyRound size={17} /> {busy ? "Opening..." : "Enter your space"}<ArrowUpRight size={16} /></button>
      </form>
      <button type="button" className={styles.textButton} onClick={sendLink} disabled={busy}><Mail size={16} /> Send me a secure sign-in link</button>
    </section>
  </main>;
}
