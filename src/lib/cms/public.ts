import type { CmsDocument } from "@/lib/cms/types";

const fallbackSlugs = [
  "business-pack-catalogue-flow",
  "ack-st-pauls-karen-west",
  "portfolio-generator",
  "ai-document-studio",
  "cybersecurity-learning-lab",
  "3d-farm-marketplace",
  "audio-technical-services",
  "portfolio-websites",
  "business-website-packs",
  "ecommerce-websites",
];

function publicHeaders() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return key ? { apikey: key, Authorization: `Bearer ${key}` } : undefined;
}

export async function getPublishedCmsSlugs() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !publicHeaders()) return fallbackSlugs;
  try {
    const response = await fetch(`${url}/rest/v1/cms_documents?select=slug&kind=in.(project,service)&status=eq.published&order=slug.asc`, {
      headers: publicHeaders(),
      next: { revalidate: false },
    });
    if (!response.ok) return fallbackSlugs;
    const rows = await response.json() as Array<{ slug: string }>;
    return rows.length ? rows.map((row) => row.slug) : fallbackSlugs;
  } catch {
    return fallbackSlugs;
  }
}

export async function getPublishedCmsDocument(slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !publicHeaders()) return null;
  try {
    const response = await fetch(`${url}/rest/v1/cms_documents?select=id,workspace_id,kind,slug,title,status,schema_version,draft_body,published_body,version,updated_at,published_at&slug=eq.${encodeURIComponent(slug)}&kind=in.(project,service)&status=eq.published&limit=1`, {
      headers: publicHeaders(),
      next: { revalidate: false },
    });
    if (!response.ok) return null;
    const rows = await response.json() as CmsDocument[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
