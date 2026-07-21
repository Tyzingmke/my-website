import Image from "next/image";
import { process, profile } from "@/data/site";

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell split">
          <div>
            <p className="eyebrow">About</p>
            <h1>{profile.name}</h1>
            <p>{profile.role}</p>
          </div>
          <div className="portrait-wrap">
            <Image src="/images/antony-studio.png" alt="Professional studio portrait of Antony" width={943} height={1536} />
          </div>
        </div>
      </section>
      <section className="section">
        <div className="shell split">
          <h2>Built from discipline, templates and careful scope.</h2>
          <div>
            <p className="lead">I am building a practical website service for small businesses and individuals who need professional online presence without complicated software or high monthly costs.</p>
            <ol className="process">
              {process.map((item) => <li key={item}>{item}</li>)}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
