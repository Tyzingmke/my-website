import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { StructuredData } from "@/components/StructuredData";
import { profile, services } from "@/data/site";

const siteUrl = "https://www.tonyconsults.co.ke";

export const metadata: Metadata = {
  title: "Website Cost in Kenya: 2026 Pricing Guide",
  description: "A practical guide to Tony Consults website prices in Kenya, what affects the cost, which recurring expenses stay separate and how to choose a useful scope.",
  alternates: { canonical: "/guides/website-cost-kenya/" },
};

const faqs = [
  ["What is the lowest-cost website option?", "The current Single-Page Starter range is KES 3,000-4,000 for a focused one-page presence with contact and WhatsApp actions."],
  ["Are domain and hosting included in the website price?", "Domain, hosting and paid third-party services are scoped separately so ownership and recurring costs remain clear."],
  ["Why does a catalogue cost more than a simple website?", "A catalogue needs structured product data, categories, filtering or search and carefully prepared order messages, so the content and testing are more involved."],
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
  ["One focused page", "Mobile layout", "WhatsApp and contact actions"],
  ["Three structured pages", "Gallery or map", "Customer enquiry route"],
  ["Five structured pages", "Portfolio and testimonials", "Focused revision and handover"],
  ["Products and categories", "Search or filtering", "Prefilled WhatsApp orders"],
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
          <h2 data-reveal>KES 3,000<br />to KES 12,000.</h2>
          <p data-reveal>That range covers Tony Consults&apos; current starting packages, from a focused single page to a fuller business website or WhatsApp catalogue. The final quote depends on the actual work, and recurring services remain separate.</p>
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
