import Script from "next/script";
import Link from "next/link";
import { ArrowRight, Heart, MessageCircle, NotebookPen, Sparkles } from "lucide-react";
import { NicheAccess } from "@/components/NicheAccess";
import styles from "./niche.module.css";

const rotatingLines = ["My private messenger", "A space for honest notes", "Messages travel over encrypted HTTPS", "Private uploads use expiring access links", "A small place to share a thought", "Typing indicators are never stored", "A password-gated collection", "Built for gentle conversations", "A room for images and voice notes", "A quieter corner of the web", "A conversation at your own pace", "Soft themes for day and night", "Messages can be removed by their sender", "A private room beside the shared one", "Notes that rotate without rushing", "Designed to be seen on a phone", "Every attachment has a short-lived link", "A place to return to", "A page made with intention", "Keep the good thoughts close"];

export default function NichePage() {
  return <NicheAccess>
    <Script src="https://www.tiktok.com/embed.js" strategy="afterInteractive" />
    <section className={styles.hero}><div className={styles.heroCopy}><p><Heart size={15} fill="currentColor" /> Private collection</p><h1>A little space<br />to stay close.</h1><span>Messages, moments, and a few words worth keeping.</span><Link href="/niche/chat/">Open messenger <ArrowRight size={17} /></Link></div><img className={styles.roseHero} src="/niche/rose-bouquet.png" alt="A bouquet of pale pink roses" /></section>
    <section className={styles.rotatingText} aria-label="Private messenger details">{rotatingLines.map((line, index) => <span key={line} style={{ animationDelay: `${index * 2.8}s` }}>{line}</span>)}</section>
    <section className={styles.privateCards} aria-label="Private pages"><Link href="/niche/chat/"><MessageCircle /><span>Messenger</span><small>Chat, images and voice notes</small><ArrowRight /></Link><Link href="/niche/private/"><Heart /><span>Private room</span><small>A separate conversation</small><ArrowRight /></Link><Link href="/niche/notes/"><NotebookPen /><span>Love notes</span><small>A rotating quote collection</small><ArrowRight /></Link><Link href="/niche/play/"><Sparkles /><span>Play corner</span><small>Feelings and playful questions</small><ArrowRight /></Link></section>
    <section className={styles.creator} aria-labelledby="creator-title"><div><p>Live video moments</p><h2 id="creator-title">Videos in motion.</h2><span>A rotating creator stream presented inside this private page.</span></div><blockquote className="tiktok-embed" cite="https://www.tiktok.com/@_n.i.c.h.e_" data-unique-id="_n.i.c.h.e_" data-embed-type="creator" style={{ maxWidth: 780, minWidth: 288 }}><section><span>Loading video moments...</span></section></blockquote></section>
    <footer className={styles.footer}><img src="/niche/rose-bouquet.png" alt="" /><p>Made with care.</p></footer>
  </NicheAccess>;
}
