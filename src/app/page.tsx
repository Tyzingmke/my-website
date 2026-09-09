import Image from "next/image";
import Link from "next/link";
import { ArrowRight, AudioLines, Boxes, BriefcaseBusiness, Code2, FileKey2, Gauge, ShieldCheck, TicketCheck, Wrench } from "lucide-react";

const disciplines = [
  ["Digital systems", "Websites, CMS platforms, client portals and practical software.", Code2],
  ["Sound and broadcast", "Audio engineering, mastering, FOH and broadcast operations.", AudioLines],
  ["Mechanical thinking", "Automotive work approached with diagnostic discipline.", Wrench],
  ["Security practice", "Security-minded delivery while continuing formal certification.", ShieldCheck],
];

const productTracks = [
  ["01", "Build", "Project-led websites, products and bespoke portals."],
  ["02", "Operate", "Content, tickets, assets and customer work in one place."],
  ["03", "Sell", "Protected files, orders and partner storefronts."],
];

export default function Home() {
  return <main className="platform-shell">
    <header className="platform-nav">
      <Link href="/" className="platform-brand"><span>TC</span><b>Tony Consults</b><small>Systems for real work</small></Link>
      <nav><a href="#work">Work</a><a href="#platform">Platform</a><a href="#services">Services</a><Link href="/admin/">Admin</Link></nav>
      <Link href="/contact/" className="nav-contact">Start a conversation <ArrowRight size={16} /></Link>
    </header>

    <section className="platform-hero">
      <div className="hero-index"><span>Independent systems studio</span><span>Nairobi, Kenya</span></div>
      <div className="hero-copy">
        <p className="platform-eyebrow">Tony Consults / Antony Njoroge</p>
        <h1>One practice.<br /><em>Many disciplines.</em></h1>
        <p className="hero-summary">I build digital platforms, clear audio systems and useful technical work that holds together after launch.</p>
        <div className="hero-actions"><Link href="/contact/" className="action-primary">Discuss a project <ArrowRight size={17} /></Link><a href="#platform" className="action-secondary">Explore the platform</a></div>
      </div>
      <figure className="hero-image"><Image src="/images/platform-collage.png" alt="A Tony Consults studio collage of web systems, audio engineering, automotive blueprints and security practice." width={1664} height={936} priority /><figcaption>Web / Audio / Automotive / Security</figcaption></figure>
    </section>

    <section id="work" className="discipline-section">
      <div className="section-intro"><p className="platform-eyebrow">What I work across</p><h2>Connected by a habit of finding the real problem.</h2></div>
      <div className="discipline-list">{disciplines.map(([name, description, Icon], index) => <article key={name as string}><span>0{index + 1}</span><div><Icon size={23} /><h3>{name as string}</h3><p>{description as string}</p></div><ArrowRight size={20} /></article>)}</div>
    </section>

    <section id="platform" className="platform-section">
      <div className="platform-heading"><p className="platform-eyebrow">The Tony Consults platform</p><h2>A home for the work<br />around the work.</h2><p>Not a collection of disconnected pages. A single operating system for content, customers, digital products and the people who help run them.</p></div>
      <div className="platform-screen" aria-label="Platform capabilities">
        <div className="screen-head"><span><i /><i /><i /></span><b>tonyconsults.co.ke / workspace</b><small>Live architecture</small></div>
        <aside><span>WORKSPACE</span><b>Operations</b><a>Overview</a><a>Content</a><a>Tickets</a><a>Marketplace</a><a>People</a><a>Insights</a></aside>
        <div className="screen-content"><div className="screen-heading"><div><small>OVERVIEW</small><h3>Everything with an owner.</h3></div><span><Gauge size={18} /> System healthy</span></div><div className="screen-metrics"><div><span>New tickets</span><b>08</b><small>Awaiting a reply</small></div><div><span>Orders</span><b>24</b><small>Across 3 products</small></div><div><span>Published</span><b>17</b><small>Pages and articles</small></div></div><div className="screen-lanes"><section><header><TicketCheck size={17} /> Client work</header><p><b>Website discovery</b><small>New enquiry · Today</small></p><p><b>Broadcast design</b><small>Assigned · In progress</small></p></section><section><header><FileKey2 size={17} /> Delivery</header><p><b>Protected downloads</b><small>Paid orders only</small></p><p><b>Creator access</b><small>Role-controlled</small></p></section></div></div>
      </div>
    </section>

    <section id="services" className="track-section"><div className="track-heading"><p className="platform-eyebrow">From a brief to an operating system</p><h2>Make the next move clear.</h2></div><div className="track-list">{productTracks.map(([index, title, body]) => <article key={index}><span>{index}</span><h3>{title}</h3><p>{body}</p><Link href="/contact/">Talk through it <ArrowRight size={16} /></Link></article>)}</div></section>

    <footer className="platform-footer"><div><span>TC</span><b>Tony Consults</b><p>Digital systems and technical practice from Kenya.</p></div><div><Link href="/admin/">Platform admin</Link><Link href="/login/">Sign in</Link><Link href="/contact/">Contact</Link></div><small>Built for useful work, not noise.</small></footer>
  </main>;
}
