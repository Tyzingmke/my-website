import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { capabilities, journey } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: "Antony Mburu's journey from automotive engineering and self-directed IT learning to web development and cybersecurity.",
};

const journeyPath = "M560 0 C560 60 560 100 560 150 C560 270 440 330 440 450 C440 570 560 630 560 750 C560 870 440 930 440 1050 C440 1170 560 1230 560 1350 C560 1470 440 1530 440 1650 C440 1770 560 1830 560 1950 C560 2070 440 2130 440 2250 C440 2320 500 2370 500 2400";

export default function AboutPage() {
  return (
    <>
      <section className="page-hero about-hero">
        <div className="section-shell page-hero-grid">
          <div className="page-hero-copy" data-reveal>
            <p className="eyebrow">About Antony</p>
            <h1>Practical thinking.<br />Digital direction.</h1>
            <p>I combine engineering discipline, self-directed technology learning and hands-on web development to build useful digital systems.</p>
          </div>
          <div className="about-portrait" data-reveal>
            <Image src="/images/antony-studio.png" alt="Antony Mburu wearing a black suit in a studio" width={941} height={1672} sizes="(max-width: 900px) 100vw, 42vw" priority />
            <span>Kenya / Remote</span>
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
