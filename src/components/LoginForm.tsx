"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) { setMessage("The Supabase connection is not configured yet."); return; }
    setSending(true); setMessage("");
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/admin/` } });
    setSending(false); setMessage(error ? error.message : "Check your inbox for a secure sign-in link.");
  }
  return <form onSubmit={submit} className="auth-form"><label>Email<input required value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="you@example.com" /></label><button disabled={sending}>{sending ? <><LoaderCircle className="spin" size={17} /> Sending link</> : <>Continue with email <ArrowRight size={17} /></>}</button>{message && <p className="form-notice" role="status">{message}</p>}</form>;
}
