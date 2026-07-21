import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { process, profile, projects, services, stats } from "@/data/site";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="reveal">
            <p className="eyebrow">{profile.location} / GitHub Pages / WhatsApp-first websites</p>
            <h1>DigitalWeb, built to sell.</h1>
            <p className="lead">
              {profile.summary} I turn scattered services, product photos and customer questions into polished sites that make enquiries easier.
            </p>
            <div className="hero-actions">
              <Link className="button dark" href="/work/">
                View work <ArrowUpRight size={17} />
              </Link>
              <Link className="button teal" href="/contact/">
                WhatsApp project <MessageCircle size={17} />
              </Link>
            </div>
          </div>
          <div className="portrait-wrap reveal">
            <Image src="/images/antony-studio.png" alt="Studio portrait of Antony Njoroge Mburu" width={943} height={1536} priority />
          </div>
        </div>
      </section>
      <div className="ticker" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index}>Static sites / Catalogue systems / Mobile polish / Clear scope / Deposits first / </span>
        ))}
      </div>
      <section className="section">
        <div className="shell split">
          <div>
            <p className="eyebrow">Positioning</p>
            <h2>Small sites. Serious outcomes.</h2>
          </div>
          <div>
            <p className="lead">
              My offer is intentionally practical: fast websites for people who need credibility, product presentation, customer enquiries, referrals and clear contact paths without expensive hosting.
            </p>
            <div className="stat-grid">
              {stats.map(([value, label]) => (
                <div className="stat" key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="section band">
        <div className="shell split">
          <div>
            <p className="eyebrow">Selected demos</p>
            <h2>Proof systems before pitching.</h2>
          </div>
          <div className="work-list">
            {projects.map((project) => (
              <article className="work-row" key={project.name}>
                <span>{project.year}</span>
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.copy}</p>
                  <div className="tags">
                    {project.tags.map((tag) => (
                      <span className="tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <strong>{project.type}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="shell split">
          <div>
            <p className="eyebrow">Services</p>
            <h2>Launch packages with clear boundaries.</h2>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <article className="service" key={service.title}>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.body}</p>
                </div>
                <span className="price">{service.price}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="shell split">
          <div>
            <p className="eyebrow">Method</p>
            <h2>Simple workflow. No mystery charges.</h2>
          </div>
          <ol className="process">
            {process.map((item) => <li key={item}>{item}</li>)}
          </ol>
        </div>
      </section>
    </>
  );
}
