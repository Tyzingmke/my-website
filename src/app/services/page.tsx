import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { process, services } from "@/data/site";

export const metadata: Metadata = {
  title: "Services",
  description: "Website design packages, catalogue systems and a clear eight-step delivery process from Antony DigitalWeb.",
};

const inclusions = [
  ["Responsive one-page layout", "WhatsApp and contact actions", "SEO and launch essentials"],
  ["Three structured pages", "Gallery, map and enquiry flow", "SEO and launch essentials"],
  ["Five structured pages", "Portfolio and testimonials", "Focused revision and handover"],
  ["Products and categories", "Search or filtering", "Prefilled WhatsApp orders"],
];

const faqs = [
  ["What do I need before we start?", "Your business details, preferred pages, available text or images, and the main action you want visitors to take. We can identify any gaps during discovery."],
  ["Are domain and hosting costs included?", "They are scoped separately so you keep clear ownership and know which recurring services you are paying for."],
  ["Will the website work on phones?", "Yes. Every package is designed and checked for mobile, tablet and desktop layouts."],
  ["Can the website grow later?", "Yes. The structure can begin small and expand into additional pages, content or enquiry features when the business is ready."],
];

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero services-hero">
        <div className="section-shell page-hero-grid page-hero-grid-wide">
          <div className="page-hero-copy" data-reveal>
            <p className="eyebrow">Services / Clear scope</p>
            <h1>A useful website<br />starts with focus.</h1>
          </div>
          <div className="page-hero-aside" data-reveal>
            <p>Choose a practical starting point. Every scope is confirmed before work begins, with domains and paid services handled transparently.</p>
            <Link className="text-link" href="/contact/">Discuss your project <ArrowUpRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="service-catalogue section-band section-light" aria-labelledby="services-title">
        <div className="section-shell">
          <div className="section-heading section-heading-split" data-reveal>
            <div><p className="eyebrow">Starting points</p><h2 id="services-title">Scope before<br />complexity.</h2></div>
            <p>The listed ranges are launch-stage guides. The final quote follows the content, features and delivery needs we agree on.</p>
          </div>
          <div className="service-catalogue-grid">
            {services.map((service, index) => (
              <article className="service-detail" data-reveal key={service.title}>
                <div className="service-detail-index">0{index + 1}</div>
                <div>
                  <span>{index === 3 ? "Catalogue system" : "Website package"}</span>
                  <h3>{service.title}</h3>
                  <p>{service.body}</p>
                </div>
                <ul>{inclusions[index].map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
                <div className="service-detail-foot"><strong>{service.price}</strong><Link href="/contact/" aria-label={`Ask about ${service.title}`}>Ask about this <ArrowUpRight size={16} /></Link></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="process-section section-band section-dark" aria-labelledby="process-title">
        <div className="section-shell process-layout">
          <div className="process-heading" data-reveal>
            <p className="eyebrow">How it works</p>
            <h2 id="process-title">A calm route<br />to launch.</h2>
            <p>Eight small decisions keep the work clear and prevent surprises near the finish line.</p>
          </div>
          <ol className="process-list">
            {process.map((step, index) => <li data-reveal key={step}><span>0{index + 1}</span><p>{step}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="faq-section section-band section-paper" aria-labelledby="faq-title">
        <div className="section-shell faq-layout">
          <div data-reveal><p className="eyebrow">Useful answers</p><h2 id="faq-title">Before we<br />begin.</h2></div>
          <div className="faq-list">
            {faqs.map(([question, answer], index) => (
              <details data-reveal key={question} open={index === 0}>
                <summary>{question}<span aria-hidden="true">+</span></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="service-cta section-band section-coral">
        <div className="section-shell cta-band" data-reveal>
          <p className="eyebrow">Ready when the problem is clear</p>
          <h2>Tell me what the website<br />needs to achieve.</h2>
          <Link className="button button-dark" href="/contact/">Start the conversation <ArrowRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
