"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "../universe.module.css";

export default function SetPasswordPage() {
  const router = useRouter(); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); if (password.length < 10) { setMessage("Choose at least 10 characters."); return; } if (password !== confirm) { setMessage("The passwords do not match."); return; } const supabase = getSupabaseBrowserClient(); if (!supabase) return; setBusy(true); const { error } = await supabase.auth.updateUser({ password }); setBusy(false); if (error) { setMessage(error.message); return; } router.replace("/us/hers"); }
  return <main className={`${styles.universe} ${styles.entry}`}><section className={styles.entryCard}><div className={styles.eyebrow}><KeyRound size={16} /> Secure account setup</div><h1>Choose your own private password.</h1><p>Only you know this password. It is never shared with the other member or stored in page content.</p><form className={styles.entryForm} onSubmit={submit}><label><span>New password</span><input value={password} type="password" autoComplete="new-password" onChange={event=>setPassword(event.target.value)} required /></label><label><span>Confirm password</span><input value={confirm} type="password" autoComplete="new-password" onChange={event=>setConfirm(event.target.value)} required /></label>{message&&<p className={styles.formMessage}>{message}</p>}<button className={styles.primaryButton} disabled={busy}>{busy?"Saving...":"Set password"}</button></form></section></main>;
}
