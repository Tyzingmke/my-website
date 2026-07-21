import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock3, Mail, MapPin, MessageCircle } from "lucide-react";
import { profile } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Antony Mburu to discuss a business website, portfolio, catalogue or practical digital system.",
};

export default function ContactPage() {
  const whatsAppMessage = encodeURIComponent("Hello Antony, I would like to discuss a website project.");
  const mailSubject = encodeURIComponent("Website project enquiry");

  return (
    <>
      <section className="page-hero contact-hero">
        <div className="section-shell contact-hero-grid">
          <div className="page-hero-copy" data-reveal>
            <p className="eyebrow">Contact / Start clearly</p>
            <h1>Tell me what<br />needs to work.</h1>
          </div>
          <p className="contact-intro" data-reveal>A good first message does not need to be formal. Share the business, the audience and the result you want the website to produce.</p>
        </div>
      </section>

      <section className="contact-options section-band section-paper">
        <div className="section-shell contact-options-grid">
          <article className="contact-option contact-option-primary" data-reveal>
            <MessageCircle size={26} />
            <span>Fastest route</span>
            <h2>Start on<br />WhatsApp.</h2>
            <p>Useful for quick project scoping, catalogue questions and local business enquiries.</p>
            <Link className="button button-acid" href={`https://wa.me/${profile.whatsapp}?text=${whatsAppMessage}`} target="_blank" rel="noreferrer">Open WhatsApp <ArrowUpRight size={18} /></Link>
          </article>
          <article className="contact-option" data-reveal>
            <Mail size={26} />
            <span>Written scope</span>
            <h2>Send an<br />email.</h2>
            <p>Best for content documents, quotations, approvals and a detailed written brief.</p>
            <Link className="button button-dark" href={`mailto:${profile.email}?subject=${mailSubject}`}>Email Antony <ArrowUpRight size={18} /></Link>
          </article>
        </div>
      </section>

      <section className="brief-section section-band section-dark">
        <div className="section-shell brief-layout">
          <div data-reveal>
            <p className="eyebrow">A useful first message</p>
            <h2>Five details<br />are enough.</h2>
          </div>
          <ol className="brief-list">
            {["What the business or organisation does", "Who the website needs to help", "The pages or content you already have", "The main action visitors should take", "Any launch date or working budget"].map((item, index) => <li data-reveal key={item}><span>0{index + 1}</span><p>{item}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="contact-facts section-band section-cobalt">
        <div className="section-shell contact-fact-grid">
          <div data-reveal><MapPin size={22} /><span>Based in</span><strong>{profile.location}</strong><p>Available for remote collaboration.</p></div>
          <div data-reveal><Clock3 size={22} /><span>Working style</span><strong>Clear milestones</strong><p>Scope, reviews and launch decisions stay visible.</p></div>
          <div data-reveal><Mail size={22} /><span>Direct email</span><strong>{profile.email}</strong><p>No contact form or hidden queue.</p></div>
        </div>
      </section>
    </>
  );
}
