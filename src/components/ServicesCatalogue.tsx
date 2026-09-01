"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CmsContentBlock, CmsDocument } from "@/lib/cms/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ThemeImage } from "@/components/ThemeImage";

type PageContent = {
  hero?: CmsContentBlock;
  sections: CmsContentBlock[];
};

function contentOf(document: CmsDocument | null): PageContent {
  const body = document?.published_body ?? document?.draft_body;
  const blocks = Array.isArray(body?.blocks) ? body.blocks : [];
  const hero = blocks.find((block) => block.type === "hero");
  return { hero, sections: blocks.filter((block) => block.id !== hero?.id) };
}

function serviceHero(document: CmsDocument) {
  const body = document.published_body ?? document.draft_body;
  const blocks = Array.isArray(body.blocks) ? body.blocks : [];
  return blocks.find((block) => block.type === "hero") ?? null;
}

export function ServicesCatalogue() {
  const [page, setPage] = useState<CmsDocument | null>(null);
  const [services, setServices] = useState<CmsDocument[]>([]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    void Promise.all([
      supabase.from("cms_documents").select("id, workspace_id, kind, slug, title, status, schema_version, draft_body, published_body, version, updated_at, published_at").eq("kind", "page").eq("slug", "services").eq("status", "published").limit(1),
      supabase.from("cms_documents").select("id, workspace_id, kind, slug, title, status, schema_version, draft_body, published_body, version, updated_at, published_at").eq("kind", "service").eq("status", "published").order("published_at", { ascending: true }),
    ]).then(([pageResult, servicesResult]) => {
      setPage((pageResult.data?.[0] as CmsDocument | undefined) ?? null);
      setServices((servicesResult.data ?? []) as CmsDocument[]);
    });
  }, []);

  const content = useMemo(() => contentOf(page), [page]);
  const collection = content.sections.find((block) => block.type === "collection");
  const features = content.sections.find((block) => block.type === "features");
  const cta = content.sections.find((block) => block.type === "cta");

  return <>
    <section className="page-hero services-hero">
      <div className="section-shell page-hero-grid page-hero-grid-wide">
        <div className="page-hero-copy" data-reveal>
          {content.hero?.eyebrow ? <p className="eyebrow">{content.hero.eyebrow}</p> : null}
          <h1>{content.hero?.heading ?? page?.title ?? "Services"}</h1>
          {content.hero?.body ? <p>{content.hero.body}</p> : null}
        </div>
        <div className="page-hero-aside" data-reveal>
          {content.hero?.imageUrl || content.hero?.imageUrlDark ? <ThemeImage className="cms-public-hero-image" lightSrc={content.hero.imageUrl} darkSrc={content.hero.imageUrlDark} alt={content.hero.heading ?? page?.title ?? "Services"} /> : null}
          {content.hero?.ctaLabel && content.hero.ctaHref ? <Link className="text-link" href={content.hero.ctaHref}>{content.hero.ctaLabel} <ArrowUpRight size={17} /></Link> : null}
        </div>
      </div>
    </section>

    <section className="service-catalogue section-band section-light" aria-labelledby="services-title">
      <div className="section-shell">
        <div className="section-heading section-heading-split" data-reveal>
          <div><p className="eyebrow">{collection?.eyebrow ?? "Service families"}</p><h2 id="services-title">{collection?.heading ?? "Choose a service"}</h2></div>
          <div><p>{collection?.body ?? "Published service packages appear here once you add and publish them in Studio."}</p>{collection?.ctaLabel && collection.ctaHref ? <Link className="text-link" href={collection.ctaHref}>{collection.ctaLabel} <ArrowUpRight size={17} /></Link> : null}</div>
        </div>
        <div className="cms-service-grid">
          {services.map((service, index) => {
            const hero = serviceHero(service);
            const body = service.published_body ?? service.draft_body;
            const details = Array.isArray(body.blocks) ? body.blocks.find((block) => block.type === "features" || block.type === "details") : null;
            return <article className={`cms-service-card project-tone-${(index % 3) + 1}`} data-reveal key={service.id}>
              {(hero?.imageUrl || hero?.imageUrlDark) ? <ThemeImage className="cms-service-card-image" lightSrc={hero.imageUrl} darkSrc={hero.imageUrlDark} alt={service.title} /> : null}
              <span>0{index + 1}</span><small>{hero?.eyebrow ?? "Service"}</small><h3>{hero?.heading ?? service.title}</h3><p>{hero?.body ?? String(body.summary ?? "")}</p>
              {details?.items?.length ? <ul>{details.items.slice(0, 4).map((item) => <li key={item}><Check size={14} />{item}</li>)}</ul> : null}
              <Link href={`/${service.slug}/`}>View editable service <ArrowUpRight size={17} /></Link>
            </article>;
          })}
        </div>
      </div>
    </section>

    {features ? <section className="section-band section-paper"><div className="section-shell cms-service-features" data-reveal><p className="eyebrow">{features.eyebrow ?? features.label}</p><h2>{features.heading}</h2>{features.body ? <p>{features.body}</p> : null}{features.items?.length ? <ul>{features.items.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul> : null}</div></section> : null}
    {cta ? <section className="service-cta section-band section-coral"><div className="section-shell cta-band" data-reveal><p className="eyebrow">{cta.eyebrow ?? cta.label}</p><h2>{cta.heading}</h2>{cta.body ? <p>{cta.body}</p> : null}{cta.ctaLabel && cta.ctaHref ? <Link className="button button-dark" href={cta.ctaHref}>{cta.ctaLabel} <ArrowRight size={18} /></Link> : null}</div></section> : null}
  </>;
}
