import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { capabilities, journey } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: "Antony Mburu's journey from automotive engineering and self-directed IT learning to web development and cybersecurity.",
};

const assetPath = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

const journeyPath = "M500 0 C500 72 610 84 610 150 C610 252 390 348 390 450 C390 552 610 648 610 750 C610 852 390 948 390 1050 C390 1152 610 1248 610 1350 C610 1452 390 1548 390 1650 C390 1752 610 1848 610 1950 C610 2052 390 2148 390 2250 C390 2322 500 2368 500 2400";

export default function AboutPage() {
  return (
    <>
      <section className="page-hero about-hero">
        <div className="section-shell about-editorial">
          <div className="about-portrait" data-about-portrait>
            <Image src={assetPath("/images/antony-logo-shirt.webp")} alt="Antony Mburu in a black TT shirt" width={941} height={1672} sizes="(max-width: 900px) 86vw, 42vw" priority />
            <span>Kenya / Remote</span>
          </div>
          <div className="page-hero-copy" data-reveal>
            <p className="eyebrow">About Antony</p>
            <h1>Practical thinking.<br />Digital direction.</h1>
            <p>I combine engineering discipline, self-directed technology learning and hands-on web development to build useful digital systems.</p>
            <p className="about-editorial-note">My work starts with the real problem, then gives every word, screen and interaction a clear job to do.</p>
          </div>
        </div>
      </section>

      <section className="story-intro section-band section-acid">
        <div className="section-shell story-intro-grid">
          <p className="eyebrow">My approach</p>
          <h2 data-reveal>Understand the system.<br />Then improve it.</h2>
          <p data-reveal>Automotive engineering taught me to diagnose carefully. Web development taught me to communicate clearly. Cybersecurity is teaching me to think ahead about risk. Together, those disciplines shape how I work.</p>
        </div>
      </section>

      <section className="journey-section section-band" aria-labelledby="journey-title">
        <div className="section-shell">
          <div className="section-heading section-heading-split" data-reveal>
            <div><p className="eyebrow">The journey</p><h2 id="journey-title">Eight useful<br />turning points.</h2></div>
            <p>Every stage added a practical layer: systems thinking, independent learning, client delivery and a stronger understanding of digital safety.</p>
          </div>

          <div className="journey-map" data-journey-map>
            <div className="journey-portrait" data-journey-portrait aria-hidden="true">
              <Image src={assetPath("/images/antony-logo-shirt.webp")} alt="" width={941} height={1672} sizes="(max-width: 900px) 78vw, 36vw" />
            </div>
            <svg className="journey-svg" viewBox="0 0 1000 2400" preserveAspectRatio="none" aria-hidden="true">
              <path className="journey-path-base" d={journeyPath} />
              <path className="journey-path-active" data-journey-path d={journeyPath} />
            </svg>
            {journey.map((item, index) => (
              <div className={`journey-row ${index % 2 === 0 ? "journey-row-right" : "journey-row-left"}`} key={item.title}>
                <span className="journey-rail" aria-hidden="true"><i /></span>
                <article className="journey-card" data-reveal>
                  <div className="journey-year">{item.year}</div>
                  <span>{item.meta}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <Link href="/contact/">Discuss a similar need <ArrowUpRight size={15} /></Link>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="capability-section section-band section-dark">
        <div className="section-shell capability-layout">
          <div data-reveal><p className="eyebrow">Current capabilities</p><h2>Skills that connect<br />to real outcomes.</h2></div>
          <div className="capability-list">
            {capabilities.map((item) => <div data-reveal key={item}><Check size={18} /><span>{item}</span></div>)}
          </div>
        </div>
      </section>
    </>
  );
}
