export type CmsDocumentKind = "page" | "project" | "service" | "site_settings";
export type CmsDocumentStatus = "draft" | "review" | "published" | "archived";

export type CmsContentBlockType = "hero" | "story" | "collection" | "features" | "cta" | "details" | "image";

export type CmsContentBlock = {
  id: string;
  type: CmsContentBlockType;
  label: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  imageUrl?: string;
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

export type SiteEvent = {
  id: number;
  workspace_id: string;
  event_type: "page_view";
  page_path: string;
  visitor_id: string;
  created_at: string;
};

export type FormSubmission = {
  id: string;
  workspace_id: string;
  form_key: string;
  status: "new" | "in_progress" | "resolved" | "spam";
  payload: Record<string, unknown>;
  source_url: string | null;
  created_at: string;
};

export type AuditEvent = {
  id: number;
  workspace_id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type WorkspaceMemberRecord = WorkspaceMembership & {
  user_id: string;
  status: "invited" | "active" | "suspended";
  profiles?: { display_name: string | null } | null;
};

export type AdminSection =
  | "overview"
  | "content"
  | "code"
  | "projects"
  | "services"
  | "inbox"
  | "assets"
  | "analytics"
  | "users"
  | "publish"
  | "audit"
  | "settings";
