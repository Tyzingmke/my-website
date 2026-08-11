import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { StructuredData } from "@/components/StructuredData";
import { profile, serviceFamilies, services } from "@/data/site";
import { ServicePreviewMockup } from "@/components/ServicePreviewMockup";

const siteUrl = "https://www.tonyconsults.co.ke";

export const metadata: Metadata = {
  title: "Website Cost in Kenya: 2026 Pricing Guide",
  description: "A practical guide to Tony Consults website prices in Kenya, what affects the cost, which recurring expenses stay separate and how to choose a useful scope.",
  alternates: { canonical: "/guides/website-cost-kenya/" },
};

const faqs = [
  ["What is the lowest-cost website option?", "The current entry level starts in the portfolio family, where the Starter tier begins around KES 4,000-6,000 for a focused online presence."],
  ["Are domain and hosting included in the website price?", "Domain, hosting and paid third-party services are scoped separately so ownership and recurring costs remain clear."],
  ["Why does an e-commerce plan cost more than a simple website?", "An e-commerce build needs product structure, payments, customer flow logic and more testing, so the work is broader than a simple brochure or portfolio site."],
  ["Can I begin small and add pages later?", "Yes. A focused first version can be expanded when the business has more content, services or customer needs."],
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": `${siteUrl}/guides/website-cost-kenya/#article`,
      headline: "Website Cost in Kenya: 2026 Pricing Guide",
      description: "A practical guide to Tony Consults website prices, recurring costs and the factors that shape a website quote in Kenya.",
      datePublished: "2026-08-11",
      dateModified: "2026-08-11",
      author: { "@id": `${siteUrl}/#antony-mburu` },
      publisher: { "@id": `${siteUrl}/#organization` },
      mainEntityOfPage: `${siteUrl}/guides/website-cost-kenya/`,
      image: `${siteUrl}/images/antony-studio.webp`,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Website Cost in Kenya", item: `${siteUrl}/guides/website-cost-kenya/` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

const packageIncludes = [
  ["Five tier levels", "Personal-brand focus", "Fast launch options"],
  ["SEO and business pages", "Login-ready upper tiers", "Growth-focused structure"],
  ["Payments and store logic", "App-ready upper tiers", "Operational scale options"],
];

export default function WebsiteCostKenyaGuide() {
  return (
    <>
      <StructuredData data={structuredData} />
      <section className="page-hero services-hero">
        <div className="section-shell page-hero-grid page-hero-grid-wide">
          <div className="page-hero-copy" data-reveal>
            <p className="eyebrow">Guide / Updated August 2026</p>
            <h1>Website cost<br />in Kenya.</h1>
          </div>
          <div className="page-hero-aside" data-reveal>
            <p>A useful quote starts with the pages, content, features and customer action the website needs. These are Tony Consults&apos; current launch-stage ranges.</p>
            <Link className="text-link" href="/contact/">Ask for a scoped quote <ArrowUpRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="story-intro section-band section-acid">
        <div className="section-shell story-intro-grid">
          <p className="eyebrow">The short answer</p>
          <h2 data-reveal>KES 4,000<br />to KES 120,000+.</h2>
          <p data-reveal>That range covers Tony Consults&apos; current tiered families, from lean portfolio launches to broader business websites and larger e-commerce systems. The final quote still depends on the actual scope, integrations and delivery expectations.</p>
        </div>
      </section>

      <section className="service-catalogue section-band section-light" aria-labelledby="pricing-title">
        <div className="section-shell">
          <div className="section-heading section-heading-split" data-reveal>
            <div><p className="eyebrow">Current ranges</p><h2 id="pricing-title">Pay for the scope<br />you can use.</h2></div>
            <p>Every range is a starting guide. Content volume, special integrations and short delivery windows can change the final scope.</p>
          </div>
          <div className="service-catalogue-grid">
            {services.map((service, index) => (
              <article className="service-detail" data-reveal key={service.title}>
                <div className="service-detail-index">0{index + 1}</div>
                <div><span>Starting range</span><h3>{service.title}</h3><p>{service.body}</p></div>
                <ul>{packageIncludes[index].map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
                <div className="service-detail-foot"><strong>{service.price}</strong><Link href="/contact/">Request this scope <ArrowUpRight size={16} /></Link></div>
              </article>
            ))}
          </div>
          <div className="service-family-grid service-family-grid-guide">
            {serviceFamilies.map((family) => (
              <article className={`service-family service-family-${family.accent}`} data-reveal key={`guide-${family.title}`}>
                <div className="service-family-media">
                  <ServicePreviewMockup kind={family.preview} label={family.title} />
                  <div className="service-family-media-overlay">
                    <span>{family.label}</span>
                    <strong>{family.range}</strong>
                  </div>
                </div>
                <div className="service-family-copy">
                  <div>
                    <span>How this family scales</span>
                    <h3>{family.title}</h3>
                    <p>{family.body}</p>
                  </div>
                  <ul className="service-family-highlights">
                    {family.highlights.map((item) => <li key={item}><Check size={15} />{item}</li>)}
                  </ul>
                </div>
                <div className="tier-grid">
                  {family.tiers.map((tier) => (
                    <article className={`tier-card${tier.name === "Gold" ? " tier-card-featured" : ""}`} key={`guide-${family.title}-${tier.name}`}>
                      <div className="tier-card-head">
                        <span>{tier.name}</span>
                        <strong>{tier.price}</strong>
                      </div>
                      <p>{tier.body}</p>
                    </article>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="process-section section-band section-dark" aria-labelledby="cost-factors-title">
        <div className="section-shell process-layout">
          <div className="process-heading" data-reveal>
            <p className="eyebrow">What changes the quote</p>
            <h2 id="cost-factors-title">Complexity has<br />specific causes.</h2>
            <p>A larger quote should point to real additional work, not a vague premium label.</p>
          </div>
          <ol className="process-list">
            {["More pages and larger amounts of content", "Product catalogues, filters or structured data entry", "Custom animation, media or interactive features", "Copywriting, image preparation or missing brand materials", "Third-party tools, paid services or account setup", "Urgent delivery dates and additional revision rounds"].map((item, index) => <li data-reveal key={item}><span>0{index + 1}</span><p>{item}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="faq-section section-band section-paper" aria-labelledby="cost-faq-title">
        <div className="section-shell faq-layout">
          <div data-reveal><p className="eyebrow">Pricing questions</p><h2 id="cost-faq-title">Keep ownership<br />and costs clear.</h2></div>
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
          <p className="eyebrow">A quote built around your need</p>
          <h2>Share the pages, audience<br />and result you need.</h2>
          <Link className="button button-dark" href={`mailto:${profile.email}?subject=Website cost enquiry`}>Request a quote <ArrowRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
