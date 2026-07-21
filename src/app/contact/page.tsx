import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { profile } from "@/data/site";

export default function ContactPage() {
  const whatsAppMessage = encodeURIComponent("Hello Antony, I would like to discuss a website project.");
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">Contact</p>
          <h1>Have a project in mind?</h1>
          <p>Send the business type, number of pages, content status, domain status and the main action customers should take.</p>
        </div>
      </section>
      <section className="section">
        <div className="shell contact-panel">
          <div>
            <h3>WhatsApp</h3>
            <p>Best for fast project scoping, catalogues and local business enquiries.</p>
            <Link className="button teal" href={`https://wa.me/${profile.whatsapp}?text=${whatsAppMessage}`}>
              <MessageCircle size={17} /> Start on WhatsApp
            </Link>
          </div>
          <div>
            <h3>Email</h3>
            <p>Best for written scope, content documents, quotations and approval notes.</p>
            <Link className="button dark" href={`mailto:${profile.email}`}>
              <Mail size={17} /> {profile.email}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
