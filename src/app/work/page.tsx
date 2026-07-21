import { projects } from "@/data/site";

export default function WorkPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">Work</p>
          <h1>Demo websites for real local problems.</h1>
          <p>These concepts are the first proof pieces: a garage, a fashion catalogue and a creative portfolio. Each one demonstrates a client-ready website system.</p>
        </div>
      </section>
      <section className="section">
        <div className="shell work-list">
          {projects.map((project) => (
            <article className="work-row" key={project.name}>
              <span>{project.year}</span>
              <div>
                <h3>{project.name}</h3>
                <p>{project.copy}</p>
                <div className="tags">
                  {project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
                </div>
              </div>
              <strong>{project.type}</strong>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
