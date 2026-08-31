"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function ContactForm() {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    setMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage("The contact system is not configured. Please use WhatsApp or email."); setSending(false); return; }
    const { data, error } = await supabase.functions.invoke("public-contact", { body: {
      name: form.get("name"), email: form.get("email"), phone: form.get("phone"), company: form.get("company"), message: form.get("message"), website: form.get("website"),
    } });
    setSending(false);
    if (error || !data?.ok) { setMessage(data?.error ?? "Your message could not be sent. Please use WhatsApp or email."); return; }
    event.currentTarget.reset();
    setMessage("Submitted successfully. Check your WhatsApp or email for my update.");
  };

  return <form className="contact-form" onSubmit={(event) => void submit(event)}>
    <label>Name<input name="name" required autoComplete="name" /></label>
    <label>Email<input name="email" required type="email" autoComplete="email" /></label>
    <label>Phone<input name="phone" type="tel" autoComplete="tel" /></label>
    <label>Business or organisation<input name="company" autoComplete="organization" /></label>
    <label className="contact-form-wide">What do you need to build?<textarea name="message" required rows={5} /></label>
    <label className="contact-form-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <div className="contact-form-actions"><button className="button button-acid" type="submit" disabled={sending}>{sending ? <LoaderCircle className="spin" size={18} /> : <ArrowUpRight size={18} />}Send project enquiry</button>{message ? <p role="status"><Check size={16} />{message}</p> : null}</div>
  </form>;
}
