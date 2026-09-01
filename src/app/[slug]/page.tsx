import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getPublishedCmsDocument, getPublishedCmsSlugs } from "@/lib/cms/public";
import { ThemeImage } from "@/components/ThemeImage";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getPublishedCmsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const document = await getPublishedCmsDocument(slug);
  return document ? {
    title: document.title,
    description: String(document.published_body?.summary ?? document.draft_body.summary ?? document.title),
    alternates: { canonical: `/${document.slug}/` },
  } : {};
}

export default async function CmsPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = await getPublishedCmsDocument(slug);
  if (!document) notFound();
  const body = document.published_body ?? document.draft_body;
  const blocks = Array.isArray(body.blocks) ? body.blocks : [];
  const hero = blocks.find((block) => block.type === "hero") ?? null;
  const supportingBlocks = blocks.filter((block) => block.id !== hero?.id);

  return <>
    <section className="page-hero cms-public-hero">
      <div className="section-shell page-hero-grid page-hero-grid-wide">
        <div className="page-hero-copy" data-reveal>
          <p className="eyebrow">{String(hero?.eyebrow ?? body.eyebrow ?? document.kind)}</p>
          <h1>{String(hero?.heading ?? document.title)}</h1>
          <p>{String(hero?.body ?? body.summary ?? body.body ?? "A Tony Consults digital project.")}</p>
        </div>
        <div className="page-hero-aside" data-reveal>
          {hero?.imageUrl || hero?.imageUrlDark ? <ThemeImage className="cms-public-hero-image" lightSrc={hero.imageUrl} darkSrc={hero.imageUrlDark} alt={hero.heading ?? document.title} /> : <p>This is a published Tony Consults {document.kind} record.</p>}
          <Link className="text-link" href="/contact/">Discuss a similar project <ArrowUpRight size={17} /></Link>
        </div>
      </div>
    </section>
    {supportingBlocks.length ? <section className="section-band section-light"><div className="section-shell cms-public-blocks">{supportingBlocks.map((block) => <article className={block.type === "image" ? "cms-public-image-block" : ""} data-reveal key={block.id}>{block.imageUrl || block.imageUrlDark ? <ThemeImage lightSrc={block.imageUrl} darkSrc={block.imageUrlDark} alt={block.heading ?? block.label} /> : null}{block.type !== "image" ? <p className="eyebrow">{block.label}</p> : null}{block.heading ? <h2>{block.heading}</h2> : null}{block.body ? <p>{block.body}</p> : null}{block.items?.length ? <ul>{block.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}{block.ctaLabel && block.ctaHref ? <Link className="text-link" href={block.ctaHref}>{block.ctaLabel} <ArrowUpRight size={17} /></Link> : null}</article>)}</div></section> : null}
    <section className="section-band section-dark"><div className="section-shell cta-band" data-reveal><p className="eyebrow">Have a similar goal?</p><h2>Let&apos;s build the useful version.</h2><Link className="button button-acid" href="/contact/">Start a conversation <ArrowRight size={18} /></Link></div></section>
  </>;
}
