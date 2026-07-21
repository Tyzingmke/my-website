import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { projects } from "@/data/site";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected website concepts and practical digital systems by Antony Mburu.",
};

export default function WorkPage() {
  return (
    <>
      <section className="page-hero work-hero">
        <div className="section-shell page-hero-grid page-hero-grid-wide">
          <div className="page-hero-copy" data-reveal>
            <p className="eyebrow">Selected work</p>
            <h1>Built to look sharp.<br />Made to work.</h1>
          </div>
          <p className="page-hero-aside" data-reveal>Seven concept systems exploring commerce, organisations, portfolios, documents, cybersecurity learning and practical booking flows.</p>
        </div>
      </section>

      <section className="project-rail-section" data-project-rail aria-labelledby="project-rail-title">
        <div className="project-pin" data-project-pin>
          <div className="project-rail-heading">
            <p className="eyebrow">Project index / 01-07</p>
            <h2 id="project-rail-title">Scroll through<br />the systems.</h2>
          </div>
          <div className="project-track" data-project-track>
            {projects.map((project, index) => (
              <article className={`project-film-card project-tone-${(index % 3) + 1}`} key={project.name}>
                <div className="film-card-visual" aria-hidden="true">
                  <div className="film-browser-bar"><i /><i /><i /><span>{project.type}</span></div>
                  <div className="film-interface">
                    <span className="film-copy film-copy-wide" />
                    <span className="film-copy" />
                    <div className="film-module-grid"><b /><b /><b /><b /></div>
                  </div>
                  <strong>{project.year}</strong>
                </div>
                <div className="film-card-copy">
                  <span>{project.type}</span>
                  <h3>{project.name}</h3>
                  <p>{project.copy}</p>
                  <div>{project.tags.map((tag) => <small key={tag}>{tag}</small>)}</div>
                </div>
                <Link href="/contact/" aria-label={`Ask about ${project.name}`}>Ask about this direction <ArrowUpRight size={17} /></Link>
              </article>
            ))}
            <div className="project-rail-end">
              <p>Have a different problem?</p>
              <h3>Let&apos;s shape the right system.</h3>
              <Link className="button button-acid" href="/contact/">Start a project <ArrowRight size={18} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="work-principles section-band section-light">
        <div className="section-shell">
          <div className="section-heading section-heading-split" data-reveal>
            <div><p className="eyebrow">The filter</p><h2>Three questions<br />before decoration.</h2></div>
            <p>Who needs this? What should they understand? What should they do next? The interface follows those answers.</p>
          </div>
          <div className="principle-grid">
            {["Audience before layout", "Action before animation", "Maintenance before complexity"].map((item, index) => <div data-reveal key={item}><span>0{index + 1}</span><h3>{item}</h3></div>)}
          </div>
        </div>
      </section>
    </>
  );
}
