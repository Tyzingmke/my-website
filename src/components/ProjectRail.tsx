"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { CmsDocument } from "@/lib/cms/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ProjectCard = {
  id: string;
  slug: string;
  title: string;
  label: string;
  summary: string;
  tags: string[];
  imageUrl: string;
  stage: "live" | "coming_soon";
};

function asProjectCard(document: CmsDocument): ProjectCard {
  const body = document.published_body ?? document.draft_body;
  const blocks = Array.isArray(body.blocks) ? body.blocks : [];
  const hero = blocks.find((block) => block.type === "hero") ?? blocks[0];
  const tags = Array.isArray(body.tags) ? body.tags.filter((tag): tag is string => typeof tag === "string") : [];
  return {
    id: document.id,
    slug: document.slug,
    title: document.title,
    label: String(body.cardLabel ?? body.eyebrow ?? hero?.eyebrow ?? "Project"),
    summary: String(body.summary ?? hero?.body ?? body.body ?? "A Tony Consults project."),
    tags,
    imageUrl: String(body.imageUrl ?? hero?.imageUrl ?? ""),
    stage: body.stage === "coming_soon" ? "coming_soon" : "live",
  };
}

function ProjectCard({ project, index }: { project: ProjectCard; index: number }) {
  return <article className={`project-film-card project-tone-${(index % 3) + 1} ${project.stage === "coming_soon" ? "is-coming-soon" : ""}`}>
    <div className="film-card-visual">
      <div className="film-browser-bar"><i /><i /><i /><span>{project.stage === "coming_soon" ? "Coming soon" : project.label}</span></div>
      {project.imageUrl ? <img src={project.imageUrl} alt="" /> : <div className="film-interface" aria-hidden="true"><span className="film-copy film-copy-wide" /><span className="film-copy" /><div className="film-module-grid"><b /><b /><b /><b /></div></div>}
      <strong>{String(index + 1).padStart(2, "0")}</strong>
    </div>
    <div className="film-card-copy"><span>{project.stage === "coming_soon" ? "Coming soon" : project.label}</span><h3>{project.title}</h3><p>{project.summary}</p>{project.tags.length ? <div>{project.tags.map((tag) => <small key={tag}>{tag}</small>)}</div> : null}</div>
    {project.stage === "coming_soon" ? <Link href="/contact/">Ask about this direction <ArrowUpRight size={17} /></Link> : <Link href={`/${project.slug}/`}>View project <ArrowUpRight size={17} /></Link>}
  </article>;
}

export function ProjectRail() {
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setLoaded(true); return; }
    void supabase.from("cms_documents").select("id, workspace_id, kind, slug, title, status, schema_version, draft_body, published_body, version, updated_at, published_at").eq("kind", "project").eq("status", "published").order("published_at", { ascending: false }).then(({ data }) => {
      setProjects(((data ?? []) as CmsDocument[]).map(asProjectCard));
      setLoaded(true);
    });
  }, []);

  return <section className="project-rail-section" data-project-rail aria-labelledby="project-rail-title"><div className="project-pin" data-project-pin><div className="project-rail-heading"><p className="eyebrow">Project index</p><h2 id="project-rail-title">Systems with room to work.</h2><p>Published projects and future builds are managed directly from Tony Consults Studio.</p></div><div className="project-track" data-project-track>{projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}{loaded && !projects.length ? <div className="project-rail-empty"><strong>Projects are being prepared.</strong><p>Published project cards from Studio will appear here.</p></div> : null}<div className="project-rail-end"><p>Have a different problem?</p><h3>Let&apos;s shape the right system.</h3><Link className="button button-acid" href="/contact/">Start a project <ArrowRight size={18} /></Link></div></div></div></section>;
}
