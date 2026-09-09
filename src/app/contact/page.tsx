import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, TicketCheck } from "lucide-react";

export default function ContactPage() {
  return <main className="simple-page"><Link href="/" className="back-link"><ArrowLeft size={16} /> Tony Consults</Link><section className="contact-card"><div><p className="platform-eyebrow">Start a conversation</p><h1>Tell me what needs to work better.</h1><p>Every enquiry becomes a trackable support ticket in the platform. You will receive a clear next step by email.</p></div><form><label>Name<input name="name" required /></label><label>Email<input type="email" name="email" required /></label><label>What are we solving?<textarea name="message" rows={5} required /></label><button type="submit">Create enquiry <ArrowRight size={17} /></button></form><aside><TicketCheck size={24}/><b>Ticket-led support</b><p>Keep project context, replies and assets in one secure place.</p><a href="mailto:antonymburu379@gmail.com"><Mail size={16}/> antonymburu379@gmail.com</a></aside></section></main>;
}
