import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { nav, profile } from "@/data/site";

export function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-lead">
        <p className="eyebrow">Available for thoughtful builds</p>
        <h2>Have a useful idea?<br />Let&apos;s make it real.</h2>
        <Link className="button button-acid" href="/contact/">Start a conversation <ArrowUpRight size={18} /></Link>
      </div>
      <div className="footer-meta">
        <div><strong>{profile.name}</strong><span>{profile.role}</span></div>
        <nav aria-label="Footer navigation">{nav.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}</nav>
        <div><a href={`mailto:${profile.email}`}>{profile.email}</a><span>{profile.location} / Remote</span></div>
      </div>
      <div className="footer-bottom"><span>Antony DigitalWeb</span><span>Built with Next.js</span><span>{new Date().getFullYear()}</span></div>
    </footer>
  );
}
