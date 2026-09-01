import type { Metadata } from "next";
import { ProjectRail } from "@/components/ProjectRail";

export const metadata: Metadata = {
  title: "Website Design Portfolio in Kenya",
  description: "Explore selected website concepts, portfolios, catalogues and practical digital systems designed by Tony Consults and Antony Mburu.",
  alternates: { canonical: "/work/" },
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

      <ProjectRail />

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
