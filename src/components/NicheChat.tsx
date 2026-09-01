"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { FileAudio, ImagePlus, LoaderCircle, Mic, Paperclip, Send, Square, Trash2, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useNicheAccessToken } from "@/components/NicheAccess";
import styles from "@/app/niche/niche.module.css";

type Room = "shared" | "personal";
type Attachment = { path: string; name: string; type: string; url?: string };
type ChatMessage = { id: string; author_name: string; message: string; created_at: string; mine: boolean; attachment?: Attachment | null };
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "audio/webm", "audio/ogg", "audio/mpeg", "audio/mp4"]);

export function NicheChat({ room, title, intro }: { room: Room; title: string; intro: string }) {
  const token = useNicheAccessToken();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("Niche");
  const [otherTyping, setOtherTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [notice, setNotice] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const typingTimer = useRef<number | null>(null);
  const typingChannel = useRef<{ send: (message: { type: "broadcast"; event: string; payload: { typing: boolean } }) => Promise<unknown> } | null>(null);

  const loadMessages = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase.functions.invoke("niche-chat", { body: { action: "list", token, room } });
    if (data?.ok) setMessages(data.messages as ChatMessage[]);
    else if (data?.error) setNotice(data.error);
    setLoading(false);
  };

  useEffect(() => {
    void loadMessages();
    const interval = window.setInterval(() => void loadMessages(), 5000);
    const supabase = getSupabaseBrowserClient();
    const channel = supabase?.channel(`niche-private-typing-${room}`, { config: { broadcast: { self: false } } }).on("broadcast", { event: "typing" }, ({ payload }) => {
      if (payload?.typing) { setOtherTyping(true); if (typingTimer.current) window.clearTimeout(typingTimer.current); typingTimer.current = window.setTimeout(() => setOtherTyping(false), 1800); }
    }).subscribe();
    typingChannel.current = channel ?? null;
    return () => { window.clearInterval(interval); if (typingTimer.current) window.clearTimeout(typingTimer.current); typingChannel.current = null; if (channel) void supabase?.removeChannel(channel); };
  }, [room, token]);

  const signalTyping = () => { void typingChannel.current?.send({ type: "broadcast", event: "typing", payload: { typing: true } }); };
  const upload = async (file: File) => {
    if (!allowedTypes.has(file.type) || file.size > 10 * 1024 * 1024) { setNotice("Use an image or audio file under 10 MB."); return; }
    const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    setUploading(true); setNotice("");
    const { data, error } = await supabase.functions.invoke("niche-chat", { body: { action: "upload-url", token, room, filename: file.name, fileType: file.type, fileSize: file.size } });
    if (error || !data?.ok) { setUploading(false); setNotice(error?.message ?? data?.error ?? "The attachment could not be prepared."); return; }
    const { error: uploadError } = await supabase.storage.from("niche-messenger").uploadToSignedUrl(data.path, data.uploadToken, file);
    setUploading(false);
    if (uploadError) { setNotice("The attachment could not be uploaded."); return; }
    setAttachment({ path: data.path, name: file.name, type: file.type, url: URL.createObjectURL(file) });
  };
  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload(file); };
  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setNotice("Voice recording is not available in this browser."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const chunks: BlobPart[] = [];
      const type = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const activeRecorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      activeRecorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      activeRecorder.onstop = () => { stream.getTracks().forEach((track) => track.stop()); const blob = new Blob(chunks, { type: activeRecorder.mimeType || "audio/webm" }); void upload(new File([blob], `voice-note-${Date.now()}.webm`, { type: blob.type || "audio/webm" })); };
      recorder.current = activeRecorder; activeRecorder.start(); setRecording(true); setNotice("Recording voice note...");
    } catch { setNotice("Microphone access is needed to record a voice note."); }
  };
  const stopRecording = () => { recorder.current?.stop(); recorder.current = null; setRecording(false); };
  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if ((!message.trim() && !attachment) || !name.trim() || uploading) return;
    const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    setSending(true); setNotice("");
    const { data } = await supabase.functions.invoke("niche-chat", { body: { action: "send", token, room, name: name.trim(), message: message.trim(), attachment } });
    setSending(false);
    if (data?.ok) { setMessage(""); if (attachment?.url) URL.revokeObjectURL(attachment.url); setAttachment(null); await loadMessages(); } else setNotice(data?.error ?? "The message could not be sent.");
  };
  const remove = async (id: string) => { const supabase = getSupabaseBrowserClient(); if (!supabase) return; const { data } = await supabase.functions.invoke("niche-chat", { body: { action: "delete", token, room, id } }); if (data?.ok) await loadMessages(); else setNotice(data?.error ?? "The message could not be deleted."); };

  return <section className={styles.chat} aria-labelledby="chat-title"><header><div><p>{room === "personal" ? "Personal conversation" : "Shared conversation"}</p><h1 id="chat-title">{title}</h1><span>{intro}</span></div><label>Your name<input value={name} maxLength={40} onChange={(event) => setName(event.target.value)} /></label></header><div className={styles.chatMessages} aria-live="polite">{loading ? <p><LoaderCircle className="spin" /> Loading conversation...</p> : messages.length ? messages.map((item) => <article className={item.mine ? styles.mine : ""} key={item.id}><header><strong>{item.author_name}</strong><time>{new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>{item.mine ? <button type="button" onClick={() => void remove(item.id)} aria-label="Delete this message"><Trash2 size={14} /></button> : null}</header>{item.message ? <p>{item.message}</p> : null}{item.attachment ? item.attachment.type.startsWith("image/") ? <img src={item.attachment.url} alt={item.attachment.name} /> : <audio controls src={item.attachment.url}>Audio attachment</audio> : null}</article>) : <p>Nothing here yet. The first note can be small.</p>}{otherTyping ? <small className={styles.typing}>Someone is typing...</small> : null}</div>{attachment ? <div className={styles.attachmentPreview}>{attachment.type.startsWith("image/") ? <ImagePlus /> : <FileAudio />}<span>{attachment.name}</span><button type="button" onClick={() => { if (attachment.url) URL.revokeObjectURL(attachment.url); setAttachment(null); }} aria-label="Remove attachment"><X size={16} /></button></div> : null}<form onSubmit={send}><div className={styles.composer}><label title="Attach image or audio"><Paperclip size={19} /><input type="file" accept="image/jpeg,image/png,image/webp,image/avif,audio/webm,audio/ogg,audio/mpeg,audio/mp4" onChange={chooseFile} /></label><button className={styles.recordButton} type="button" title={recording ? "Stop recording" : "Record voice note"} onClick={recording ? stopRecording : () => void startRecording()}>{recording ? <Square size={17} /> : <Mic size={18} />}</button><textarea value={message} maxLength={1000} onChange={(event) => { setMessage(event.target.value); signalTyping(); }} placeholder="Write a message..." /></div><button className={styles.sendButton} type="submit" disabled={sending || uploading || (!message.trim() && !attachment)}>{sending || uploading ? <LoaderCircle className="spin" /> : <Send />} Send</button></form>{notice ? <small className={styles.chatNotice} role="status">{notice}</small> : null}</section>;
}
