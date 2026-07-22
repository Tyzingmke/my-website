import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, CalendarDays, Check, Handshake } from "lucide-react";
import { capabilities, profile, projects, services } from "@/data/site";
import { HeroTypingCards } from "@/components/HeroTypingCards";

export const metadata: Metadata = {
  title: "Antony Mburu | Website Designer & Developer",
  description: "Portfolio of Antony Mburu, a Kenya-based website designer and static web systems builder.",
};

const assetPath = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

export default function Home() {
  return (
    <>
      <section className="home-hero" data-home-hero aria-labelledby="home-title">
        <div className="hero-ambient" data-hero-ambient aria-hidden="true">
          <span /><span /><span />
        </div>
        <div className="hero-map-background" aria-hidden="true">
          <svg viewBox="0 0 326 379" preserveAspectRatio="none">
            <path
              pathLength="1"
              d="M19 1 52 1c14 0 25 0 32 1 1 4 7 5 20 5 15 1 22 2 27 6 13 8 27 17 36 25 5 4 14 4 20 2 12 5 27 6 40 9 6-3 10-10 14-15 9-5 29-16 39-20 4 3 10 8 14 13 11 1 21 0 30 0-9 16-21 31-35 46v149l24 32c-6 8-10 14-17 19-1 5-7 9-13 11-3 5-9 9-14 8-9 2-14 7-14 15 0 9-5 15-9 18-2 12-8 25-14 37-3 5-6 10-8 15-3 0-5-1-7 1-18-12-41-27-60-42-1-3-4-6-7-7 4-5 5-9 3-17-39-22-109-61-147-81-3 0-5 0-5-3 0-14 1-28 0-40 4-6 7-12 7-18 1-5 5-7 9-11 1-3 5-6 6-12 2-4 6-6 11-8 4-3 3-7 2-9 4-4 8-9 9-16 1-7-3-15-3-22 0-6-3-10-6-14-1-6-5-7-8-12-2-6-7-11-7-19 2-4 1-9-2-10-4 1-7-2-7-5-2-1-4-2-4-5 0-4-2-8-3-10 3-5 9-11 14-16Z"
            />
          </svg>
        </div>
        <div className="intro-greeting" data-intro-greeting aria-hidden="true">
          <div className="intro-honeycomb" data-intro-honeycomb>
            {Array.from({ length: 42 }, (_, index) => <span className="intro-honeycomb-cell" data-intro-tile key={index} />)}
          </div>
          <div className="intro-primary" data-intro-primary>
            <span className="intro-lead" data-intro-lead>
              <span className="intro-token intro-token-tight">Hi</span>
              <span className="intro-token">,</span>
              <span className="intro-token">I&apos;m</span>
            </span>
            <strong>TONY.</strong>
          </div>
          <span className="intro-alias" data-intro-alias>or you can call me</span>
          <strong className="intro-antony" data-intro-antony>ANTONY</strong>
        </div>

        <div className="hero-background-name" data-hero-name aria-hidden="true">ANTONY</div>
        <div className="hero-background-surname" data-hero-surname aria-hidden="true">MBURU</div>
        <div className="hero-accent-plane" aria-hidden="true" />
        <div className="hero-skyline" aria-hidden="true">
          <svg viewBox="0 0 1440 190" preserveAspectRatio="none">
            <path
              className="skyline-buildings"
              d="M0 190V162h38v-10h36v-16h34v14h38v-27h36v28h42v-19h28V96h24v35h25v21h37v-39h28v39h40V86h25v66h35v-43h27v43h39v-23h31v23h42V77h26v75h37v-38h30v38h43v-20h38v20h43v-51h27v51h42v-31h32v31h42v-41h28v41h40v-22h37v22h42V90h28v62h39v-35h36v35h43v-48h28v48h42v-25h38v25h39v-33h34v33h44v-21h38v21h42v-29h35v29h56v38Z"
            />
            <g className="skyline-landmarks">
              <path className="skyline-tower" d="M286 152V96h14V78h18V61h22v17h17v74ZM374 152V88h13V66h28v22h15v64Z" />
              <path className="skyline-tower" d="M689 152V73c0-13 10-23 23-23s23 10 23 23v79Z" />
              <path className="skyline-tower" d="M922 152V81h13V65h34v16h14v71ZM1017 152V103l34-53 30 102ZM1292 152V95h16V72h26v23h16v57Z" />
              <path className="skyline-line" d="M329 61V35M401 66V42M952 65V32M1051 50V25M1321 72V44" />
              <path className="skyline-line" d="M698 50V34h28v16M712 34V9" />
              <path className="skyline-line" d="M1123 152V73M1123 73h132M1168 73l87-37M1255 36v116M1180 152l25-79" />
              <path className="skyline-line" d="M0 153H1440" />
            </g>
          </svg>
        </div>

        <div className="hero-portrait" data-hero-portrait>
          <Image
            className="hero-image hero-image-soft"
            data-hero-image="soft"
            src={assetPath("/images/antony-logo-shirt.webp")}
            alt=""
            width={941}
            height={1672}
            sizes="(max-width: 700px) 100vw, 58vw"
            aria-hidden="true"
            priority
          />
          <Image
            className="hero-image hero-image-sharp"
            data-hero-image="sharp"
            src={assetPath("/images/antony-logo-shirt.webp")}
            alt="Antony Njoroge Mburu"
            width={941}
            height={1672}
            sizes="(max-width: 700px) 100vw, 58vw"
            priority
          />
          <Image
            className="hero-image hero-image-edge"
            src={assetPath("/images/antony-logo-shirt.webp")}
            alt=""
            width={941}
            height={1672}
            sizes="(max-width: 700px) 120vw, 64vw"
            aria-hidden="true"
            priority
          />
        </div>

        <div className="hero-copy" data-hero-content>
          <p className="eyebrow">Website designer / static web systems</p>
          <h1 id="home-title">Websites built<br />for real work.</h1>
          <p>I design fast, credible digital homes for businesses, professionals and organisations.</p>
          <div className="hero-actions">
            <Link className="button button-acid" data-hero-action="book" href="/contact/">Book a call <CalendarDays size={18} /></Link>
            <a className="button button-ghost" data-hero-action="hire" href={`mailto:${profile.email}?subject=Project enquiry`}>Hire me <Handshake size={18} /></a>
          </div>
        </div>

        <HeroTypingCards />

        <Link className="hero-scroll" href="#home-about"><span>Explore</span><ArrowDown size={15} /></Link>
      </section>

      <section className="home-about section-band section-acid" id="home-about">
        <div className="section-shell home-about-grid">
          <div data-reveal>
            <p className="eyebrow">01 / About</p>
            <h2>A practical mind,<br />built through doing.</h2>
          </div>
          <div className="home-about-copy" data-reveal>
            <p>I started with engineering and followed my curiosity into IT, websites and digital systems. The common thread is simple: understand how something works, then make it work better.</p>
            <Link className="text-link" href="/about/">Read my story <ArrowUpRight size={17} /></Link>
          </div>
          <div className="capability-strip" aria-label="Core capabilities">
            {capabilities.slice(0, 4).map((item, index) => <span key={item}><b>0{index + 1}</b>{item}</span>)}
          </div>
        </div>
      </section>

      <section className="home-work section-band section-dark" id="work">
        <div className="section-shell">
          <div className="section-heading section-heading-split" data-reveal>
            <div><p className="eyebrow">02 / Selected work</p><h2>Useful systems,<br />clearly presented.</h2></div>
            <div><p>Concepts and practical builds shaped around a clear audience, a focused action and straightforward maintenance.</p><Link className="text-link light-link" href="/work/">View all projects <ArrowUpRight size={17} /></Link></div>
          </div>
          <div className="featured-grid">
            {projects.slice(0, 3).map((project, index) => (
              <article className={`featured-project project-tone-${index + 1}`} data-reveal key={project.name}>
                <div className="project-preview" aria-hidden="true">
                  <span className="preview-bar" />
                  <span className="preview-panel preview-panel-main" />
                  <span className="preview-panel preview-panel-side" />
                  <b>{project.year}</b>
                </div>
                <div className="project-card-copy"><span>{project.type}</span><h3>{project.name}</h3><p>{project.copy}</p></div>
                <Link href="/work/" aria-label={`Read more about ${project.name}`}>Read more <ArrowUpRight size={16} /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-services section-band section-light" id="services">
        <div className="section-shell">
          <div className="section-heading section-heading-split" data-reveal>
            <div><p className="eyebrow">03 / Services</p><h2>Choose the right<br />starting point.</h2></div>
            <div><p>Clear scopes for a first website, a fuller business presence or a practical catalogue system.</p><Link className="text-link" href="/services/">See services and process <ArrowUpRight size={17} /></Link></div>
          </div>
          <div className="service-preview-list">
            {services.slice(0, 3).map((service, index) => (
              <Link className="service-preview-row" href="/services/" data-reveal key={service.title}>
                <span>0{index + 1}</span><h3>{service.title}</h3><p>{service.body}</p><strong>{service.price}</strong><ArrowUpRight size={22} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-promise section-band section-cobalt" data-promise-reveal>
        <div className="promise-pixel-scene" aria-hidden="true">
          <div className="promise-pixel-identity" data-promise-identity>
            <strong data-promise-name>ANTONY</strong>
            <span>MBURU / DIGITAL SYSTEMS</span>
            <Image src={assetPath("/images/antony-logo-shirt.webp")} alt="" width={941} height={1672} sizes="(max-width: 900px) 70vw, 42vw" />
          </div>
          <div className="promise-pixel-cover">
            {Array.from({ length: 112 }, (_, index) => <i data-promise-pixel key={index} />)}
          </div>
        </div>
        <div className="section-shell promise-grid">
          <p className="eyebrow">The working standard</p>
          <h2 data-reveal>Fast enough to feel effortless.<br />Clear enough to be useful.</h2>
          <div className="promise-points" data-reveal>
            {["Responsive from the first layout", "Search-ready page structure", "Static hosting with low maintenance", "Direct enquiry pathways"].map((item) => <span key={item}><Check size={17} />{item}</span>)}
          </div>
        </div>
      </section>
    </>
  );
}
