import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { StructuredData } from "@/components/StructuredData";

const siteUrl = "https://www.tonyconsults.co.ke";

export const metadata: Metadata = {
  title: "Website Design in Kenya",
  description: "Mobile-first website design in Kenya for businesses, professionals and organisations. Tony Consults builds fast sites, portfolios and WhatsApp catalogue systems.",
  alternates: { canonical: "/website-design-kenya/" },
};

const focusAreas = [
  {
    title: "Business websites",
    body: "Clear service pages, contact routes and trust-building content for established or growing Kenyan businesses.",
    items: ["Mobile-first layouts", "WhatsApp and phone actions", "Search-ready page structure"],
  },
  {
    title: "Professional portfolios",
    body: "A credible digital home for consultants, creatives, graduates and technical professionals presenting their work.",
    items: ["Focused personal positioning", "Project and capability pages", "Direct enquiry pathways"],
  },
  {
    title: "WhatsApp catalogues",
    body: "Practical product browsing with categories, prices and pre-filled order messages for small and medium sellers.",
    items: ["Product categories", "Search or filtering", "Prefilled WhatsApp orders"],
  },
];

const faqs = [
  ["Do you work with clients outside Nairobi?", "Yes. Tony Consults works remotely with businesses, professionals and organisations across Kenya."],
  ["Will I own my domain and website accounts?", "Yes. Domain, hosting and service ownership are kept clear so you retain control of the website and its recurring costs."],
  ["Can customers contact me through WhatsApp?", "Yes. WhatsApp, phone, email and enquiry actions can be placed where they make sense in the customer journey."],
  ["How much does a website cost?", "The scope depends on pages, content and features. Current starting ranges are explained in the website cost guide and confirmed before work begins."],
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/website-design-kenya/#webpage`,
      url: `${siteUrl}/website-design-kenya/`,
      name: "Website Design in Kenya",
      description: "Mobile-first website design and practical digital systems for businesses, professionals and organisations in Kenya.",
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${siteUrl}/#website-design-service` },
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#website-design-service`,
      name: "Website design in Kenya",
      serviceType: "Website design and development",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: { "@type": "Country", name: "Kenya" },
      audience: [
        { "@type": "BusinessAudience", audienceType: "Small and medium businesses" },
        { "@type": "Audience", audienceType: "Professionals and organisations" },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Website Design in Kenya", item: `${siteUrl}/website-design-kenya/` },
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

export default function WebsiteDesignKenyaPage() {
  return (
    <>
      <StructuredData data={structuredData} />
      <section className="page-hero services-hero">
        <div className="section-shell page-hero-grid page-hero-grid-wide">
          <div className="page-hero-copy" data-reveal>
            <p className="eyebrow">Website design / Kenya</p>
            <h1>Credible websites<br />for real businesses.</h1>
          </div>
          <div className="page-hero-aside" data-reveal>
            <p>Tony Consults builds fast, mobile-first websites for Kenyan businesses, professionals and organisations, with clear ownership and practical enquiry routes.</p>
            <Link className="text-link" href="/contact/">Discuss your website <ArrowUpRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="story-intro section-band section-acid">
        <div className="section-shell story-intro-grid">
          <p className="eyebrow">Designed for local use</p>
          <h2 data-reveal>Easy on a phone.<br />Clear in a hurry.</h2>
          <p data-reveal>Customers should quickly understand what you do, why they can trust you and how to contact you. The structure supports mobile browsing, WhatsApp enquiries and straightforward maintenance without turning the website into a complicated system.</p>
        </div>
      </section>

      <section className="service-catalogue section-band section-light" aria-labelledby="kenya-services-title">
        <div className="section-shell">
          <div className="section-heading section-heading-split" data-reveal>
            <div><p className="eyebrow">Useful starting points</p><h2 id="kenya-services-title">Built around<br />the next action.</h2></div>
            <p>Each page has a clear job: explain, prove, guide or help a visitor make contact.</p>
          </div>
          <div className="service-catalogue-grid">
            {focusAreas.map((area, index) => (
              <article className="service-detail" data-reveal key={area.title}>
                <div className="service-detail-index">0{index + 1}</div>
                <div><span>Website direction</span><h3>{area.title}</h3><p>{area.body}</p></div>
                <ul>{area.items.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
                <div className="service-detail-foot"><Link href="/services/">View packages <ArrowUpRight size={16} /></Link></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="process-section section-band section-dark" aria-labelledby="kenya-process-title">
        <div className="section-shell process-layout">
          <div className="process-heading" data-reveal>
            <p className="eyebrow">What the build includes</p>
            <h2 id="kenya-process-title">A strong base<br />before extras.</h2>
            <p>The essentials are handled first so the website remains useful, fast and easy to own.</p>
          </div>
          <ol className="process-list">
            {["A responsive layout for phones, tablets and laptops", "Descriptive page titles, headings and internal links", "A clear contact route through WhatsApp, phone or email", "Domain connection, HTTPS checks and launch testing", "A sitemap and crawlable static pages for search engines", "A handover that keeps account ownership visible"].map((item, index) => <li data-reveal key={item}><span>0{index + 1}</span><p>{item}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="faq-section section-band section-paper" aria-labelledby="kenya-faq-title">
        <div className="section-shell faq-layout">
          <div data-reveal><p className="eyebrow">Common questions</p><h2 id="kenya-faq-title">Before you<br />choose a scope.</h2></div>
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
          <p className="eyebrow">A clear first conversation</p>
          <h2>Tell me what customers<br />need to do next.</h2>
          <Link className="button button-dark" href="/contact/">Start a website project <ArrowRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
