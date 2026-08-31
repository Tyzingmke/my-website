export type CmsDocumentKind = "page" | "project" | "service" | "site_settings";
export type CmsDocumentStatus = "draft" | "review" | "published" | "archived";

export type CmsContentBlockType = "hero" | "story" | "collection" | "features" | "cta" | "details";

export type CmsContentBlock = {
  id: string;
  type: CmsContentBlockType;
  label: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  items?: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

export type CmsDocumentBody = {
  eyebrow?: string;
  summary?: string;
  body?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
  featured?: boolean;
  blocks?: CmsContentBlock[];
  [key: string]: unknown;
};

export type CmsDocument = {
  id: string;
  workspace_id: string;
  kind: CmsDocumentKind;
  slug: string;
  title: string;
  status: CmsDocumentStatus;
  schema_version: number;
  draft_body: CmsDocumentBody;
  published_body: CmsDocumentBody | null;
  version: number;
  updated_at: string;
  published_at: string | null;
};

export type WorkspaceMembership = {
  workspace_id: string;
  role: "owner" | "admin" | "editor" | "viewer";
  capabilities: string[];
  workspaces?: { name: string; slug: string } | null;
};

export type AdminSection =
  | "overview"
  | "content"
  | "projects"
  | "services"
  | "inbox"
  | "assets"
  | "users"
  | "publish"
  | "audit"
  | "settings";
