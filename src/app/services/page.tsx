import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { process, serviceFamilies } from "@/data/site";
import { ServicePreviewMockup } from "@/components/ServicePreviewMockup";

export const metadata: Metadata = {
  title: "Web Design Services in Kenya",
  description: "Explore Tony Consults portfolio websites, business website packs, e-commerce tiers and a clear delivery process for Kenyan businesses and professionals.",
  alternates: { canonical: "/services/" },
};

const faqs = [
  ["What do I need before we start?", "Your business details, preferred pages, available text or images, and the main action you want visitors to take. We can identify any gaps during discovery."],
  ["Are domain and hosting costs included?", "They are scoped separately so you keep clear ownership and know which recurring services you are paying for."],
  ["Will the website work on phones?", "Yes. Every package is designed and checked for mobile, tablet and desktop layouts."],
  ["Can the website grow later?", "Yes. Each service family has tier levels so you can begin with a practical scope and move upward when the business needs more pages, integrations or app direction."],
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
            <Link className="text-link" href="/guides/website-cost-kenya/">Read the Kenya pricing guide <ArrowUpRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="service-catalogue section-band section-light" aria-labelledby="services-title">
        <div className="section-shell">
          <div className="section-heading section-heading-split" data-reveal>
            <div><p className="eyebrow">Service families</p><h2 id="services-title">Tiered plans,<br />clear upgrades.</h2></div>
            <p>Each family starts with a smaller version and rises into broader functionality. That keeps the first build usable while leaving room for SEO, logins, payments, mobile apps or richer business workflows later.</p>
          </div>
          <div className="service-family-grid">
            {serviceFamilies.map((family, index) => (
              <article className={`service-family service-family-${family.accent}`} data-reveal key={family.title}>
                <div className="service-family-media">
                  <ServicePreviewMockup kind={family.preview} label={family.title} />
                  <div className="service-family-media-overlay">
                    <span>{family.label}</span>
                    <strong>{family.range}</strong>
                  </div>
                </div>
                <div className="service-family-copy">
                  <div className="service-detail-index">0{index + 1}</div>
                  <div>
                    <span>Plan family</span>
                    <h3>{family.title}</h3>
                    <p>{family.body}</p>
                  </div>
                  <ul className="service-family-highlights">
                    {family.highlights.map((item) => <li key={item}><Check size={15} />{item}</li>)}
                  </ul>
                </div>
                <div className="tier-grid">
                  {family.tiers.map((tier) => (
                    <article className={`tier-card${tier.name === "Gold" ? " tier-card-featured" : ""}`} key={`${family.title}-${tier.name}`}>
                      <div className="tier-card-head">
                        <span>{tier.name}</span>
                        <strong>{tier.price}</strong>
                      </div>
                      <p>{tier.body}</p>
                      <ul>
                        {tier.features.map((item) => <li key={item}><Check size={14} />{item}</li>)}
                      </ul>
                    </article>
                  ))}
                </div>
                <div className="service-family-foot">
                  <strong>{family.range}</strong>
                  <Link href="/contact/" aria-label={`Ask about ${family.title}`}>Ask about this family <ArrowUpRight size={16} /></Link>
                </div>
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
