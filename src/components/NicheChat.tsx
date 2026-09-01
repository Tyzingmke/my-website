"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { LoaderCircle, Send, Trash2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "@/app/niche/niche.module.css";

type ChatMessage = { id: string; author_name: string; message: string; created_at: string; mine: boolean };

export function NicheChat({ token }: { token: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("Niche");
  const [otherTyping, setOtherTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const typingTimer = useRef<number | null>(null);
  const typingChannel = useRef<{ send: (message: { type: "broadcast"; event: string; payload: { typing: boolean } }) => Promise<unknown> } | null>(null);

  const loadMessages = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase.functions.invoke("niche-chat", { body: { action: "list", token } });
    if (data?.ok) setMessages(data.messages as ChatMessage[]);
    setLoading(false);
  };

  useEffect(() => {
    void loadMessages();
    const interval = window.setInterval(() => void loadMessages(), 5000);
    const supabase = getSupabaseBrowserClient();
    const channel = supabase?.channel("niche-private-typing", { config: { broadcast: { self: false } } }).on("broadcast", { event: "typing" }, ({ payload }) => {
      if (payload?.typing) {
        setOtherTyping(true);
        if (typingTimer.current) window.clearTimeout(typingTimer.current);
        typingTimer.current = window.setTimeout(() => setOtherTyping(false), 1800);
      }
    }).subscribe();
    typingChannel.current = channel ?? null;
    return () => { window.clearInterval(interval); if (typingTimer.current) window.clearTimeout(typingTimer.current); typingChannel.current = null; if (channel) void supabase?.removeChannel(channel); };
  }, [token]);

  const signalTyping = () => {
    void typingChannel.current?.send({ type: "broadcast", event: "typing", payload: { typing: true } });
  };

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim() || !name.trim()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSending(true);
    const { data } = await supabase.functions.invoke("niche-chat", { body: { action: "send", token, name: name.trim(), message: message.trim() } });
    setSending(false);
    if (data?.ok) { setMessage(""); await loadMessages(); }
  };

  const remove = async (id: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase.functions.invoke("niche-chat", { body: { action: "delete", token, id } });
    if (data?.ok) await loadMessages();
  };

  return <section className={styles.chat} aria-labelledby="chat-title"><header><div><p>02 / a quiet conversation</p><h2 id="chat-title">Leave a note.</h2></div><label>Your name<input value={name} maxLength={40} onChange={(event) => setName(event.target.value)} /></label></header><div className={styles.chatMessages} aria-live="polite">{loading ? <p><LoaderCircle className="spin" /> Loading conversation...</p> : messages.length ? messages.map((item) => <article className={item.mine ? styles.mine : ""} key={item.id}><header><strong>{item.author_name}</strong><time>{new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>{item.mine ? <button type="button" onClick={() => void remove(item.id)} aria-label="Delete this message"><Trash2 size={14} /></button> : null}</header><p>{item.message}</p></article>) : <p>Nothing here yet. The first note can be small.</p>}{otherTyping ? <small className={styles.typing}>Someone is typing...</small> : null}</div><form onSubmit={send}><textarea value={message} maxLength={1000} onChange={(event) => { setMessage(event.target.value); signalTyping(); }} placeholder="Write something thoughtful..." /><button type="submit" disabled={sending || !message.trim()}>{sending ? <LoaderCircle className="spin" /> : <Send />} Send</button></form></section>;
}
