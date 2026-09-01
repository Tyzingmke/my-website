"use client";

import {
  Activity,
  Archive,
  BarChart3,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Cloud,
  CloudOff,
  Code2,
  Eye,
  FileText,
  FolderKanban,
  Globe2,
  Image,
  Inbox,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Menu,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelRightClose,
  Plus,
  Rocket,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  Upload,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { projects, services } from "@/data/site";
import type { AdminSection, AuditEvent, CmsContentBlock, CmsContentBlockType, CmsDocument, CmsDocumentBody, CmsDocumentKind, FormSubmission, MediaAsset, SiteEvent, WorkspaceMemberRecord, WorkspaceMembership } from "@/lib/cms/types";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type ConnectionState = "checking" | "setup" | "signed-out" | "ready" | "error";
type ViewportMode = "desktop" | "tablet" | "mobile";
type EditorMode = "blocks" | "code";
type EditableBlockField = "label" | "eyebrow" | "heading" | "body" | "imageUrl" | "imageUrlDark" | "ctaLabel" | "ctaHref";

const sectionItems: Array<{ id: AdminSection; label: string; icon: typeof LayoutDashboard; capability?: string }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "content", label: "Pages", icon: FileText, capability: "page.read" },
  { id: "code", label: "Code", icon: Code2, capability: "integration.manage" },
  { id: "projects", label: "Projects", icon: FolderKanban, capability: "page.read" },
  { id: "services", label: "Services", icon: Wrench, capability: "page.read" },
  { id: "inbox", label: "Inbox", icon: Inbox, capability: "form.read" },
  { id: "assets", label: "Assets", icon: Image, capability: "asset.manage" },
  { id: "analytics", label: "Analytics", icon: BarChart3, capability: "audit.read" },
  { id: "users", label: "Users", icon: Users, capability: "user.manage" },
  { id: "publish", label: "Publish", icon: Rocket, capability: "page.publish" },
  { id: "audit", label: "Audit", icon: Activity, capability: "audit.read" },
  { id: "settings", label: "Settings", icon: Settings, capability: "integration.manage" },
];

const previewDocuments: CmsDocument[] = [
  { id: "preview-home", workspace_id: "preview", kind: "page", slug: "home", title: "Home", status: "published", schema_version: 1, draft_body: { eyebrow: "Tony Consults", summary: "Websites built for real work.", body: "The public homepage and its motion-led content." }, published_body: {}, version: 1, updated_at: new Date().toISOString(), published_at: new Date().toISOString() },
  { id: "preview-about", workspace_id: "preview", kind: "page", slug: "about", title: "About Antony", status: "published", schema_version: 1, draft_body: { eyebrow: "My journey", summary: "Engineering thinking, digital craft.", body: "Profile, journey, capabilities and working standards." }, published_body: {}, version: 1, updated_at: new Date().toISOString(), published_at: new Date().toISOString() },
  ...projects.slice(0, 4).map((project, index) => ({ id: `preview-project-${index}`, workspace_id: "preview", kind: "project" as const, slug: `project-${index + 1}`, title: project.name, status: "published" as const, schema_version: 1, draft_body: { eyebrow: project.type, summary: project.copy }, published_body: {}, version: 1, updated_at: new Date().toISOString(), published_at: new Date().toISOString() })),
  ...services.slice(0, 4).map((service, index) => ({ id: `preview-service-${index}`, workspace_id: "preview", kind: "service" as const, slug: `service-${index + 1}`, title: service.title, status: "published" as const, schema_version: 1, draft_body: { summary: service.body }, published_body: {}, version: 1, updated_at: new Date().toISOString(), published_at: new Date().toISOString() })),
];

function hasCapability(membership: WorkspaceMembership | null, capability?: string) {
  if (!capability) return true;
  if (!membership) return false;
  return membership.role === "owner" || membership.role === "admin" || membership.capabilities.includes(capability);
}

function kindForSection(section: AdminSection): CmsDocumentKind | null {
  if (section === "content") return "page";
  if (section === "projects") return "project";
  if (section === "services") return "service";
  return null;
}

const BLOCK_TITLES: Record<CmsContentBlockType, string> = {
  hero: "Hero",
  story: "Editorial section",
  collection: "Content collection",
  features: "Feature list",
  cta: "Call to action",
  details: "Details",
  image: "Image",
};

function fallbackBlocks(document: CmsDocument): CmsContentBlock[] {
  const body = document.draft_body;
  const hero: CmsContentBlock = {
    id: "hero",
    type: "hero",
    label: "Hero",
    eyebrow: String(body.eyebrow ?? document.kind),
    heading: document.title,
    body: String(body.summary ?? ""),
    ctaLabel: String(body.ctaLabel ?? "Get in touch"),
    ctaHref: String(body.ctaHref ?? "/contact/"),
  };
  const detail: CmsContentBlock = {
    id: "details",
    type: "details",
    label: "Details",
    heading: "What this page says",
    body: String(body.body ?? "Add the supporting content for this page."),
  };
  return [hero, detail];
}

function documentBlocks(document: CmsDocument) {
  const blocks = document.draft_body.blocks;
  return Array.isArray(blocks) && blocks.length ? blocks : fallbackBlocks(document);
}

export function AdminStudio() {
  const configured = isSupabaseConfigured();
  const [connection, setConnection] = useState<ConnectionState>(configured ? "checking" : "setup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [membership, setMembership] = useState<WorkspaceMembership | null>(null);
  const [documents, setDocuments] = useState<CmsDocument[]>(previewDocuments);
  const [siteEvents, setSiteEvents] = useState<SiteEvent[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [assets, setAssets] = useState<Array<MediaAsset & { publicUrl: string }>>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [members, setMembers] = useState<WorkspaceMemberRecord[]>([]);
  const [section, setSection] = useState<AdminSection>("overview");
  const [selectedId, setSelectedId] = useState(previewDocuments[0].id);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const loadWorkspace = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setConnection("signed-out");
      return;
    }

    const { data: memberships, error: membershipError } = await supabase
      .from("workspace_memberships")
      .select("workspace_id, role, capabilities, workspaces(name, slug)")
      .eq("user_id", sessionData.session.user.id)
      .eq("status", "active")
      .limit(1);

    if (membershipError || !memberships?.length) {
      setAuthMessage(membershipError?.message ?? "This account has no active Tony Consults workspace membership.");
      setConnection("error");
      return;
    }

    const activeMembership = memberships[0] as unknown as WorkspaceMembership;
    setMembership(activeMembership);

    const { data: cmsDocuments, error: documentError } = await supabase
      .from("cms_documents")
      .select("id, workspace_id, kind, slug, title, status, schema_version, draft_body, published_body, version, updated_at, published_at")
      .eq("workspace_id", activeMembership.workspace_id)
      .order("updated_at", { ascending: false });

    if (documentError) {
      setAuthMessage(documentError.message);
      setConnection("error");
      return;
    }

    setDocuments((cmsDocuments as CmsDocument[]) ?? []);
    const { data: latestAudit, error: auditError } = await supabase
      .from("audit_events")
      .select("id, workspace_id, actor_id, action, entity_type, entity_id, metadata, created_at")
      .eq("workspace_id", activeMembership.workspace_id)
      .order("created_at", { ascending: false })
      .limit(500);
    if (!auditError) {
      const audit = (latestAudit as AuditEvent[]) ?? [];
      setAuditEvents(audit);
      setSiteEvents(audit.filter((event) => event.action === "site.page_view").map((event) => ({ id: event.id, workspace_id: event.workspace_id, event_type: "page_view", page_path: String(event.metadata.page_path ?? "/"), visitor_id: event.entity_id ?? "unknown", created_at: event.created_at })));
    }
    const [{ data: inbox }, { data: workspaceMembers }, { data: mediaAssets }] = await Promise.all([
      supabase.from("form_submissions").select("id, workspace_id, form_key, status, payload, source_url, created_at").eq("workspace_id", activeMembership.workspace_id).order("created_at", { ascending: false }).limit(100),
      supabase.from("workspace_memberships").select("workspace_id, user_id, role, status, capabilities, profiles(display_name)").eq("workspace_id", activeMembership.workspace_id).order("created_at", { ascending: true }),
      supabase.from("media_assets").select("id, workspace_id, storage_path, filename, mime_type, size_bytes, alt_text, created_at").eq("workspace_id", activeMembership.workspace_id).order("created_at", { ascending: false }),
    ]);
    setSubmissions((inbox as FormSubmission[]) ?? []);
    setAssets(((mediaAssets as MediaAsset[]) ?? []).map((asset) => ({ ...asset, publicUrl: supabase.storage.from("portfolio-assets").getPublicUrl(asset.storage_path).data.publicUrl })));
    setMembers(((workspaceMembers ?? []) as Array<WorkspaceMemberRecord & { profiles?: { display_name: string | null }[] | { display_name: string | null } | null }>).map((member) => ({
      ...member,
      profiles: Array.isArray(member.profiles) ? member.profiles[0] ?? null : member.profiles ?? null,
    })));
    if (cmsDocuments?.[0]) setSelectedId(cmsDocuments[0].id);
    setConnection("ready");
  }, []);

  useEffect(() => {
    if (!configured) return;
    void loadWorkspace();
    const supabase = getSupabaseBrowserClient();
    const subscription = supabase?.auth.onAuthStateChange(() => void loadWorkspace());
    return () => subscription?.data.subscription.unsubscribe();
  }, [configured, loadWorkspace]);

  const availableSections = useMemo(
    () => sectionItems.filter((item) => connection !== "ready" || hasCapability(membership, item.capability)),
    [connection, membership],
  );
  const filteredDocuments = useMemo(() => {
    const kind = kindForSection(section);
    const source = kind ? documents.filter((document) => document.kind === kind) : documents;
    const normalized = query.trim().toLowerCase();
    return normalized ? source.filter((document) => `${document.title} ${document.slug}`.toLowerCase().includes(normalized)) : source;
  }, [documents, query, section]);
  const selected = documents.find((document) => document.id === selectedId) ?? filteredDocuments[0] ?? null;
  const workspaceName = membership?.workspaces?.name ?? "Tony Consults";
  const isReadOnly = connection !== "ready" || !hasCapability(membership, "page.edit");

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true);
    setAuthMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setAuthMessage(error.message);
  }

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    setMembership(null);
    setDocuments(previewDocuments);
    setSiteEvents([]);
    setSubmissions([]);
    setAssets([]);
    setAuditEvents([]);
    setMembers([]);
    setConnection("signed-out");
  }

  function updateSelected(field: "title" | "slug" | "summary" | "body", value: string) {
    if (!selected || isReadOnly) return;
    setDocuments((current) => current.map((document) => {
      if (document.id !== selected.id) return document;
      if (field === "title" || field === "slug") return { ...document, [field]: value };
      return { ...document, draft_body: { ...document.draft_body, [field]: value } };
    }));
  }

  function updateSelectedBody(nextBody: CmsDocumentBody) {
    if (!selected || isReadOnly) return;
    setDocuments((current) => current.map((document) => document.id === selected.id ? { ...document, draft_body: nextBody } : document));
  }

  async function saveSelected(publish = false) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !selected || isReadOnly) return;
    if (publish && !hasCapability(membership, "page.publish")) {
      setNotice("Your role can edit drafts but cannot publish them.");
      return;
    }
    setBusy(true);
    setNotice("");
    const payload = {
      title: selected.title.trim(),
      slug: selected.slug.trim(),
      draft_body: selected.draft_body,
      status: publish ? "published" : selected.status,
      ...(publish ? { published_body: selected.draft_body, published_at: new Date().toISOString() } : {}),
    };
    const { data, error } = await supabase.functions.invoke("studio-cms", { body: {
      action: "save-document",
      id: selected.id,
      version: selected.version,
      ...payload,
      publish,
    } });
    setBusy(false);
    if (error || !data?.ok || !data.document) {
      const message = data?.error ?? error?.message ?? "The CMS save did not return an updated document.";
      setNotice(message.includes("0 rows") ? "This record changed elsewhere. Reload before saving." : message);
      return;
    }
    setDocuments((current) => current.map((document) => document.id === selected.id ? data.document as CmsDocument : document));
    setNotice(publish ? "Published in the CMS. The next GitHub Pages build generates its public route." : "Draft saved and recorded in the workspace audit trail.");
  }

  async function createDocument() {
    const supabase = getSupabaseBrowserClient();
    const kind = kindForSection(section);
    if (!supabase || !membership || !kind || isReadOnly) return;

    setBusy(true);
    setNotice("");
    const baseTitle = kind === "page" ? "New page" : kind === "project" ? "New project" : "New service";
    const slugBase = `${kind}-${Date.now().toString(36)}`;
    const { data, error } = await supabase.functions.invoke("studio-cms", { body: { action: "create-document", kind, title: baseTitle, slug: slugBase } });
    setBusy(false);
    if (error || !data?.ok || !data.document) {
      setNotice(data?.error ?? error?.message ?? "The project could not be created.");
      return;
    }
    const document = data.document as CmsDocument;
    setDocuments((current) => [document, ...current]);
    setSelectedId(document.id);
    setNotice("New draft created. Give it a title, URL and summary before saving.");
  }

  async function deleteSubmission(id: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !membership || !hasCapability(membership, "form.manage")) return;
    if (!window.confirm("Delete this enquiry permanently? This cannot be undone.")) return;

    setBusy(true);
    setNotice("");
    const { data, error } = await supabase.functions.invoke("studio-cms", { body: { action: "delete-submission", id } });
    setBusy(false);
    if (error || !data?.ok) {
      setNotice(data?.error ?? error?.message ?? "The enquiry could not be deleted.");
      return;
    }
    setSubmissions((current) => current.filter((submission) => submission.id !== id));
    setNotice("Enquiry deleted.");
  }

  async function uploadImage(file: File) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !membership || !hasCapability(membership, "asset.manage")) return null;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setNotice("Use an image smaller than 10 MB.");
      return null;
    }
    const filename = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
    const storagePath = `${membership.workspace_id}/projects/${crypto.randomUUID()}-${filename}`;
    setBusy(true);
    setNotice("");
    const { error: uploadError } = await supabase.storage.from("portfolio-assets").upload(storagePath, file, { cacheControl: "31536000", upsert: false });
    if (uploadError) {
      setBusy(false);
      setNotice(uploadError.message);
      return null;
    }
    const { data: publicUrl } = supabase.storage.from("portfolio-assets").getPublicUrl(storagePath);
    const { error: assetError } = await supabase.from("media_assets").insert({ workspace_id: membership.workspace_id, storage_path: storagePath, filename: file.name, mime_type: file.type, size_bytes: file.size, alt_text: "" });
    setBusy(false);
    if (assetError) {
      await supabase.storage.from("portfolio-assets").remove([storagePath]);
      setNotice(assetError.message);
      return null;
    }
    setNotice("Image uploaded securely to the workspace asset library.");
    return publicUrl.publicUrl;
  }

  async function deleteDocument(id: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !membership || !hasCapability(membership, "page.publish")) return;
    if (!window.confirm("Delete this project permanently? Its public project page will no longer be available.")) return;
    setBusy(true);
    setNotice("");
    const { data, error } = await supabase.functions.invoke("studio-cms", { body: { action: "delete-document", id } });
    setBusy(false);
    if (error || !data?.ok) {
      setNotice(data?.error ?? error?.message ?? "The project could not be deleted.");
      return;
    }
    setDocuments((current) => current.filter((document) => document.id !== id));
    setSelectedId((current) => current === id ? "" : current);
    setNotice("Project deleted.");
  }

  function chooseSection(next: AdminSection) {
    setSection(next);
    setQuery("");
    setMobileNavOpen(false);
    const kind = kindForSection(next);
    const nextDocument = documents.find((document) => !kind || document.kind === kind);
    if (nextDocument) setSelectedId(nextDocument.id);
  }

  if (connection === "signed-out" || connection === "error") {
    return <div className={`tony-studio studio-theme-${theme} studio-auth-screen`} data-connection={connection}>
      <LoginState email={email} password={password} message={authMessage} busy={busy} onEmail={setEmail} onPassword={setPassword} onSubmit={handleSignIn} />
    </div>;
  }

  return (
    <div className={`tony-studio studio-theme-${theme}`} data-connection={connection}>
      <header className="studio-commandbar">
        <div className="studio-command-brand">
          <button className="studio-icon mobile-only" type="button" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu /></button>
          <span className="studio-mark" aria-hidden="true"><img src="/icon.svg" alt="" /></span>
          <span><small>Studio</small><strong>{workspaceName}</strong></span>
        </div>
        <div className="studio-command-center">
          <button className="studio-icon" type="button" aria-label={leftOpen ? "Close navigator" : "Open navigator"} onClick={() => setLeftOpen((value) => !value)}><PanelLeftClose /></button>
          <span className={`studio-status status-${connection}`}><i />{connection === "ready" ? "Synced" : connection === "setup" ? "Setup needed" : connection === "checking" ? "Connecting" : "Attention"}</span>
          <div className="studio-breakpoints" aria-label="Preview size">
            <button className={viewport === "desktop" ? "active" : ""} type="button" aria-label="Desktop preview" onClick={() => setViewport("desktop")}><Monitor /></button>
            <button className={viewport === "tablet" ? "active" : ""} type="button" aria-label="Tablet preview" onClick={() => setViewport("tablet")}><BookOpen /></button>
            <button className={viewport === "mobile" ? "active" : ""} type="button" aria-label="Mobile preview" onClick={() => setViewport("mobile")}><Smartphone /></button>
          </div>
        </div>
        <div className="studio-command-actions">
          <button className="studio-icon" type="button" aria-label={`Use ${theme === "dark" ? "light" : "dark"} theme`} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun /> : <Moon />}</button>
          <a className="studio-button secondary" href="/" target="_blank" rel="noreferrer"><Eye /> Preview</a>
          <button className="studio-button primary" type="button" disabled={busy || isReadOnly || !selected} onClick={() => void saveSelected(false)}>{busy ? <LoaderCircle className="spin" /> : <Save />} Save</button>
          {connection === "ready" ? <button className="studio-icon" type="button" aria-label="Sign out" onClick={() => void handleSignOut()}><LogOut /></button> : null}
          <button className="studio-icon" type="button" aria-label={rightOpen ? "Close inspector" : "Open inspector"} onClick={() => setRightOpen((value) => !value)}><PanelRightClose /></button>
        </div>
      </header>

      <div className={`studio-body ${leftOpen ? "" : "left-closed"} ${rightOpen ? "" : "right-closed"}`}>
        <aside className={`studio-navigation ${mobileNavOpen ? "mobile-open" : ""}`}>
          <button className="studio-mobile-close mobile-only" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}><X /></button>
          <nav className="studio-rail" aria-label="Admin sections">
            {availableSections.map((item) => <button key={item.id} className={section === item.id ? "active" : ""} type="button" aria-label={item.label} title={item.label} onClick={() => chooseSection(item.id)}><item.icon /></button>)}
          </nav>
          <div className="studio-navigator">
            <div className="studio-panel-title"><span><small>Workspace</small><strong>{sectionItems.find((item) => item.id === section)?.label}</strong></span><button className="studio-icon" type="button" aria-label="Collapse navigator" onClick={() => setLeftOpen(false)}><ChevronLeft /></button></div>
            <label className="studio-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search content" /></label>
            {kindForSection(section) ? <div className="studio-document-list">{filteredDocuments.length ? filteredDocuments.map((document) => <button key={document.id} className={document.id === selected?.id ? "active" : ""} type="button" onClick={() => setSelectedId(document.id)}><span className={`document-icon kind-${document.kind}`}>{document.kind === "project" ? <FolderKanban /> : document.kind === "service" ? <Wrench /> : <FileText />}</span><span><strong>{document.title}</strong><small>/{document.slug}</small></span><i className={`document-dot status-${document.status}`} /></button>) : <EmptyState compact title="No records" body="Create the first item after Supabase is connected." />}</div> : <SectionSummary section={section} documents={documents} />}
            <button className="studio-add" type="button" disabled={busy || isReadOnly || !kindForSection(section)} onClick={() => void createDocument()}><Plus /> New {kindForSection(section) ?? "item"}</button>
          </div>
        </aside>

        <main className="studio-canvas-area">
          {connection === "checking" ? <CenteredState icon={LoaderCircle} spin title="Opening your workspace" body="Checking the local session and secure workspace membership." /> : null}
          {connection === "setup" ? <SetupState /> : null}
          {connection === "ready" || connection === "setup" ? section === "code" ? <CodeWorkspace enabled={connection === "ready" && hasCapability(membership, "integration.manage")} theme={theme} /> : <StudioCanvas section={section} document={selected} documents={documents} siteEvents={siteEvents} submissions={submissions} assets={assets} auditEvents={auditEvents} members={members} viewport={viewport} readOnly={isReadOnly} notice={notice} canManageInbox={hasCapability(membership, "form.manage")} canManageAssets={hasCapability(membership, "asset.manage")} canDeleteDocuments={hasCapability(membership, "page.publish")} onDeleteSubmission={(id) => void deleteSubmission(id)} onDeleteDocument={(id) => void deleteDocument(id)} onUploadImage={uploadImage} onUpdate={updateSelected} onBodyUpdate={updateSelectedBody} onSave={() => void saveSelected(false)} onPublish={() => void saveSelected(true)} onStudioTheme={setTheme} /> : null}
        </main>

        <aside className="studio-inspector">
          <div className="studio-panel-title"><span><small>Inspector</small><strong>{selected?.title ?? "Selection"}</strong></span><button className="studio-icon" type="button" aria-label="Collapse inspector" onClick={() => setRightOpen(false)}><ChevronRight /></button></div>
          <Inspector document={selected} membership={membership} connection={connection} />
        </aside>
      </div>
      {mobileNavOpen ? <button className="studio-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} /> : null}
    </div>
  );
}

function SetupState() {
  return <div className="studio-setup-banner"><CloudOff /><div><strong>Supabase is not connected yet</strong><p>This is a read-only preview built from the current portfolio content. Add the two public values from <code>.env.example</code> after creating the dedicated Tony Consults project.</p></div><span>Private by default</span></div>;
}

function LoginState({ email, password, message, busy, onEmail, onPassword, onSubmit }: { email: string; password: string; message: string; busy: boolean; onEmail: (value: string) => void; onPassword: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <main className="studio-auth-wrap"><form className="studio-auth-card" onSubmit={onSubmit}><div className="studio-auth-brand"><span className="studio-mark" aria-hidden="true">TC</span><div><small>Tony Consults</small><strong>Studio</strong></div></div><span className="studio-auth-icon"><LockKeyhole /></span><small className="studio-auth-kicker">Private workspace</small><h1>Welcome back.</h1><p>Sign in to manage pages, projects, services, and publishing for Tony Consults.</p><label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => onEmail(event.target.value)} required /></label><label>Password<input type="password" minLength={8} autoComplete="current-password" value={password} onChange={(event) => onPassword(event.target.value)} required /></label>{message ? <div className="studio-alert">{message}</div> : null}<button className="studio-button primary wide" disabled={busy}>{busy ? <LoaderCircle className="spin" /> : <ShieldCheck />}Sign in to Studio</button><span className="studio-auth-footnote"><ShieldCheck /> Secured with workspace access control</span></form></main>;
}

function StudioCanvas({ section, document, documents, siteEvents, submissions, assets, auditEvents, members, viewport, readOnly, notice, canManageInbox, canManageAssets, canDeleteDocuments, onDeleteSubmission, onDeleteDocument, onUploadImage, onUpdate, onBodyUpdate, onSave, onPublish, onStudioTheme }: { section: AdminSection; document: CmsDocument | null; documents: CmsDocument[]; siteEvents: SiteEvent[]; submissions: FormSubmission[]; assets: Array<MediaAsset & { publicUrl: string }>; auditEvents: AuditEvent[]; members: WorkspaceMemberRecord[]; viewport: ViewportMode; readOnly: boolean; notice: string; canManageInbox: boolean; canManageAssets: boolean; canDeleteDocuments: boolean; onDeleteSubmission: (id: string) => void; onDeleteDocument: (id: string) => void; onUploadImage: (file: File) => Promise<string | null>; onUpdate: (field: "title" | "slug" | "summary" | "body", value: string) => void; onBodyUpdate: (body: CmsDocumentBody) => void; onSave: () => void; onPublish: () => void; onStudioTheme: (theme: "dark" | "light") => void }) {
  const [mode, setMode] = useState<EditorMode>("blocks");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const editorial = kindForSection(section);
  const blocks = document ? documentBlocks(document) : [];

  useEffect(() => {
    if (!document) return;
    setCode(JSON.stringify(document.draft_body, null, 2));
    setCodeError("");
  }, [document?.id]);

  if (!editorial) return <OperationsDashboard section={section} documents={documents} siteEvents={siteEvents} submissions={submissions} assets={assets} auditEvents={auditEvents} members={members} notice={notice} canManageInbox={canManageInbox} onDeleteSubmission={onDeleteSubmission} onStudioTheme={onStudioTheme} />;
  if (!document) return <CenteredState icon={Archive} title="Nothing selected" body="Choose a record from the navigator or create a new one." />;

  const updateBlocks = (nextBlocks: CmsContentBlock[]) => onBodyUpdate({ ...document.draft_body, blocks: nextBlocks });
  const updateBlock = (id: string, field: EditableBlockField, value: string) => updateBlocks(blocks.map((block) => block.id === id ? { ...block, [field]: value } : block));
  const updateItems = (id: string, value: string) => updateBlocks(blocks.map((block) => block.id === id ? { ...block, items: value.split("\n").map((item) => item.trim()).filter(Boolean) } : block));
  const addBlock = (type: CmsContentBlockType) => updateBlocks([...blocks, { id: `${type}-${Date.now().toString(36)}`, type, label: BLOCK_TITLES[type], heading: `New ${BLOCK_TITLES[type]}`, body: "Add the content for this section." }]);
  const removeBlock = (id: string) => updateBlocks(blocks.filter((block) => block.id !== id));
  const applyCode = () => {
    try {
      const parsed = JSON.parse(code) as CmsDocumentBody;
      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("Use one JSON object for this page.");
      onBodyUpdate(parsed);
      setCode(JSON.stringify(parsed, null, 2));
      setCodeError("");
    } catch (error) {
      setCodeError(error instanceof Error ? error.message : "This is not valid page JSON.");
    }
  };

  return <div className="studio-editor"><div className="studio-editor-heading"><div><small>{document.kind} editor</small><h1>{document.title}</h1><p>Build the same editorial structure used by the public page. Changes update this preview immediately and are saved as a revision.</p></div><div className="studio-editor-actions"><span className={`studio-pill status-${document.status}`}>{document.status}</span>{document.kind === "project" && canDeleteDocuments ? <button className="studio-button danger" disabled={readOnly} onClick={() => onDeleteDocument(document.id)}><Trash2 /> Delete</button> : null}<button className="studio-button secondary" disabled={readOnly} onClick={onSave}><Save /> Save draft</button><button className="studio-button primary" disabled={readOnly} onClick={onPublish}><Rocket /> Publish</button></div></div>{notice ? <div className="studio-notice"><Check />{notice}</div> : null}<div className="studio-mode-switch" role="tablist" aria-label="Editing mode"><button className={mode === "blocks" ? "active" : ""} type="button" role="tab" aria-selected={mode === "blocks"} onClick={() => setMode("blocks")}><LayoutDashboard /> Visual blocks</button><button className={mode === "code" ? "active" : ""} type="button" role="tab" aria-selected={mode === "code"} onClick={() => { setCode(JSON.stringify(document.draft_body, null, 2)); setCodeError(""); setMode("code"); }}><Code2 /> Content JSON</button></div><div className={`studio-preview-frame viewport-${viewport}`}><div className="studio-preview-toolbar"><i /><i /><i /><span>tonyconsults.co.ke/{document.slug}</span></div><PageCompositionPreview document={document} blocks={blocks} /></div>{mode === "blocks" ? <section className="studio-block-editor"><div className="studio-section-heading"><div><small>Page composition</small><h2>Editable sections</h2></div><span>{blocks.length} blocks</span></div><div className="studio-page-basics"><label>Page title<input value={document.title} disabled={readOnly} onChange={(event) => onUpdate("title", event.target.value)} /></label><label>URL slug<input value={document.slug} disabled={readOnly} onChange={(event) => onUpdate("slug", event.target.value)} /></label></div>{document.kind === "project" ? <div className="studio-project-settings"><label>Card label<input value={String(document.draft_body.cardLabel ?? document.draft_body.eyebrow ?? "Project")} disabled={readOnly} onChange={(event) => onBodyUpdate({ ...document.draft_body, cardLabel: event.target.value })} /></label><label>Card stage<select value={String(document.draft_body.stage ?? "live")} disabled={readOnly} onChange={(event) => onBodyUpdate({ ...document.draft_body, stage: event.target.value })}><option value="live">Live project</option><option value="coming_soon">Coming soon</option></select></label><label className="field-wide">Card tags, one per line<textarea rows={3} value={Array.isArray(document.draft_body.tags) ? document.draft_body.tags.join("\n") : ""} disabled={readOnly} onChange={(event) => onBodyUpdate({ ...document.draft_body, tags: event.target.value.split("\n").map((tag) => tag.trim()).filter(Boolean) })} /></label></div> : null}<div className="studio-block-list">{blocks.map((block, index) => <ContentBlockEditor block={block} index={index} readOnly={readOnly} canUpload={canManageAssets} onUpdate={updateBlock} onItems={updateItems} onRemove={removeBlock} onUploadImage={onUploadImage} />)}</div><div className="studio-add-blocks"><span>Add a section</span>{(Object.keys(BLOCK_TITLES) as CmsContentBlockType[]).map((type) => <button key={type} type="button" disabled={readOnly} onClick={() => addBlock(type)}><Plus /> {BLOCK_TITLES[type]}</button>)}</div></section> : <section className="studio-code-editor"><div className="studio-section-heading"><div><small>Advanced editing</small><h2>Page content JSON</h2></div><span>Layout code stays protected</span></div><p>Use this for exact content changes, links, and block settings. It edits the same data as the visual blocks, not the website source code.</p><textarea spellCheck={false} value={code} disabled={readOnly} onChange={(event) => { setCode(event.target.value); setCodeError(""); }} /><div className="studio-code-actions"><small>{codeError || "Valid JSON is applied only when you choose Apply changes."}</small><button className="studio-button secondary" type="button" disabled={readOnly} onClick={applyCode}><Code2 /> Apply changes</button></div></section>}</div>;
}

function PageCompositionPreview({ document, blocks }: { document: CmsDocument; blocks: CmsContentBlock[] }) {
  const hero = blocks.find((block) => block.type === "hero") ?? blocks[0];
  return <article className="studio-page-preview">{hero?.imageUrl ? <img className="studio-preview-image" src={hero.imageUrl} alt="" /> : null}<span>{hero?.eyebrow ?? document.kind}</span><h2>{hero?.heading ?? document.title}</h2><p>{hero?.body ?? document.draft_body.summary ?? "Add a concise description."}</p>{blocks.slice(1, 4).map((block) => <section className={`studio-preview-block type-${block.type}`} key={block.id}>{block.imageUrl ? <img className="studio-preview-block-image" src={block.imageUrl} alt="" /> : null}<small>{block.label}</small><strong>{block.heading}</strong>{block.body ? <p>{block.body}</p> : null}{block.items?.length ? <div>{block.items.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div> : null}</section>)}</article>;
}

function ContentBlockEditor({ block, index, readOnly, canUpload, onUpdate, onItems, onRemove, onUploadImage }: { block: CmsContentBlock; index: number; readOnly: boolean; canUpload: boolean; onUpdate: (id: string, field: EditableBlockField, value: string) => void; onItems: (id: string, value: string) => void; onRemove: (id: string) => void; onUploadImage: (file: File) => Promise<string | null> }) {
  return <article className="studio-content-block"><header><span>0{index + 1}</span><div><small>{BLOCK_TITLES[block.type]}</small><strong>{block.label}</strong></div><button type="button" disabled={readOnly} aria-label={`Remove ${block.label}`} onClick={() => onRemove(block.id)}><X /></button></header><div className="studio-field-grid"><label>Section label<input value={block.label} disabled={readOnly} onChange={(event) => onUpdate(block.id, "label", event.target.value)} /></label><label>Eyebrow<input value={block.eyebrow ?? ""} disabled={readOnly} onChange={(event) => onUpdate(block.id, "eyebrow", event.target.value)} /></label><label className="field-wide">Heading<input value={block.heading ?? ""} disabled={readOnly} onChange={(event) => onUpdate(block.id, "heading", event.target.value)} /></label><div className="studio-theme-image-fields field-wide"><label>Light-mode image URL<input type="url" value={block.imageUrl ?? ""} placeholder="https://... or /images/..." disabled={readOnly} onChange={(event) => onUpdate(block.id, "imageUrl", event.target.value)} /></label><label>Dark-mode image URL<input type="url" value={block.imageUrlDark ?? ""} placeholder="Optional dark-mode alternative" disabled={readOnly} onChange={(event) => onUpdate(block.id, "imageUrlDark", event.target.value)} /></label></div><div className="studio-theme-image-uploads field-wide"><ImageUpload disabled={readOnly || !canUpload} label="Upload light-mode image" onUploaded={(url) => onUpdate(block.id, "imageUrl", url)} onUploadImage={onUploadImage} /><ImageUpload disabled={readOnly || !canUpload} label="Upload dark-mode image" onUploaded={(url) => onUpdate(block.id, "imageUrlDark", url)} onUploadImage={onUploadImage} /></div><label className="field-wide">Supporting copy<textarea rows={3} value={block.body ?? ""} disabled={readOnly} onChange={(event) => onUpdate(block.id, "body", event.target.value)} /></label>{block.type === "features" || block.type === "collection" ? <label className="field-wide">Items, one per line<textarea rows={4} value={(block.items ?? []).join("\n")} disabled={readOnly} onChange={(event) => onItems(block.id, event.target.value)} /></label> : null}<label>Button label<input value={block.ctaLabel ?? ""} disabled={readOnly} onChange={(event) => onUpdate(block.id, "ctaLabel", event.target.value)} /></label><label>Button link<input value={block.ctaHref ?? ""} disabled={readOnly} onChange={(event) => onUpdate(block.id, "ctaHref", event.target.value)} /></label></div></article>;
}

function ImageUpload({ disabled, label = "Drop a light-mode image here", onUploaded, onUploadImage }: { disabled: boolean; label?: string; onUploaded: (url: string) => void; onUploadImage: (file: File) => Promise<string | null> }) {
  const [uploading, setUploading] = useState(false);
  const accept = async (file?: File) => { if (!file || disabled) return; setUploading(true); const url = await onUploadImage(file); setUploading(false); if (url) onUploaded(url); };
  return <label className="studio-image-upload field-wide" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void accept(event.dataTransfer.files[0]); }}><Upload /><span><strong>{uploading ? "Uploading image..." : label}</strong><small>or browse for JPG, PNG, WebP, AVIF or SVG up to 10 MB</small></span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml" disabled={disabled || uploading} onChange={(event) => void accept(event.target.files?.[0])} /></label>;
}

const codeGroups = [
  { label: "Pages", files: ["src/app/page.tsx", "src/app/about/page.tsx", "src/app/work/page.tsx", "src/app/services/page.tsx", "src/app/contact/page.tsx", "src/app/website-design-kenya/page.tsx", "src/app/guides/website-cost-kenya/page.tsx", "src/app/[slug]/page.tsx", "src/app/not-found.tsx"] },
  { label: "Motion and loading", files: ["src/components/PageTransition.tsx", "src/components/MotionProvider.tsx", "src/components/FirstLoadScreen.tsx", "src/components/ScrollExperience.tsx", "src/lib/performanceProfile.ts", "src/lib/scrollMemory.ts"] },
  { label: "Images and forms", files: ["src/components/HeroTypingCards.tsx", "src/components/ServicePreviewMockup.tsx", "src/components/ThemeImage.tsx", "src/components/ContactForm.tsx", "src/components/CookieConsent.tsx"] },
  { label: "Chrome and SEO", files: ["src/components/Header.tsx", "src/components/Footer.tsx", "src/components/AppFrame.tsx", "src/components/SiteTheme.tsx", "src/components/StructuredData.tsx", "src/components/SiteAnalytics.tsx", "src/app/layout.tsx", "src/app/sitemap.ts", "src/app/robots.ts"] },
  { label: "Content and styling", files: ["src/data/site.ts", "src/lib/cms/public.ts", "src/app/globals.css", "src/app/admin/studio.css", "src/components/admin/AdminStudio.tsx"] },
] as const;

function CodeWorkspace({ enabled, theme }: { enabled: boolean; theme: "dark" | "light" }) {
  const [file, setFile] = useState<string>(codeGroups[0].files[0]);
  const [source, setSource] = useState("");
  const [sha, setSha] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Choose a file to load its current production source.");

  const loadFile = useCallback(async (path: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !enabled) return;
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.functions.invoke("studio-code-v2", { body: { action: "read", path } });
    setLoading(false);
    if (error || !data?.ok) {
      setMessage(data?.error ?? error?.message ?? "The secure code gateway is not ready yet.");
      return;
    }
    setFile(path);
    setSource(data.content);
    setSha(data.sha);
    setMessage(`Loaded ${path}`);
  }, [enabled]);

  useEffect(() => { void loadFile(file); }, [file, loadFile]);

  const saveFile = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !enabled || !source || !sha) return;
    setSaving(true);
    setMessage("");
    const { data, error } = await supabase.functions.invoke("studio-code-v2", { body: { action: "write", path: file, content: source, sha, message: `Update ${file} from Tony Consults Studio` } });
    setSaving(false);
    if (error || !data?.ok) {
      setMessage(data?.error ?? error?.message ?? "The code update could not be published.");
      return;
    }
    setSha(data.sha);
    setMessage("Saved to GitHub. The Pages deployment has started.");
  };

  const activeGroup = codeGroups.find((group) => group.files.includes(file as never))?.label ?? "Source";
  const activeLabel = file.endsWith("src/app/page.tsx") ? "Home page" : file.includes("/app/") ? `${file.split("/").slice(2, -1).join(" / ")} page` : activeGroup;

  return <div className={`studio-code-workspace code-theme-${theme}`}><div className="studio-editor-heading"><div><small>Code workspace / editing {activeLabel}</small><h1>Design and page code</h1><p>Edit the real GitHub source behind the selected public page or shared system. Each save creates a versioned commit and starts the Pages deployment.</p></div><span className="studio-pill">Protected gateway</span></div><div className="studio-code-layout"><aside className="studio-code-tree">{codeGroups.map((group) => <section key={group.label}><small>{group.label}</small>{group.files.map((path) => <button className={path === file ? "active" : ""} type="button" key={path} onClick={() => setFile(path)}><Code2 /><span>{path.split("/").pop()}</span></button>)}</section>)}</aside><section className="studio-code-surface"><header><div className="studio-code-file"><span>{file}</span><small>Editing: {activeLabel}</small></div><div><button className="studio-button secondary" type="button" disabled={loading || saving} onClick={() => void loadFile(file)}><Cloud /> Reload</button><button className="studio-button primary" type="button" disabled={!enabled || loading || saving || !sha} onClick={() => void saveFile()}>{saving ? <LoaderCircle className="spin" /> : <Save />} Save & deploy</button></div></header>{!enabled ? <div className="studio-code-gateway-note"><LockKeyhole /><div><strong>Owner access required</strong><p>Code editing is available only to an authenticated owner with integration permission.</p></div></div> : null}<SyntaxCodeEditor file={file} source={source} disabled={!enabled || loading} onChange={setSource} placeholder={loading ? "Loading source..." : "Select a source file from the workspace."} />{message ? <footer><span>{message}</span><small>GitHub commits are versioned and can be rolled back there.</small></footer> : null}</section></div></div>;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character] ?? character);
}

function highlightedSource(source: string, file: string) {
  const cssFile = file.endsWith(".css");
  const tokenPattern = cssFile
    ? /(\/\*[\s\S]*?\*\/|#[0-9a-fA-F]{3,8}\b|--[\w-]+|\b\d+(?:\.\d+)?(?:px|rem|%|vh|vw|s)?\b|[{}:;])/g
    : /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|`(?:\\.|[^`])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:const|let|var|return|import|from|export|default|function|async|await|if|else|new|type|interface|extends|true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b)/g;
  return source.split(tokenPattern).map((part, index) => {
    if (!part) return "";
    const token = cssFile
      ? part.startsWith("/*") ? "comment" : part.startsWith("#") ? "color" : part.startsWith("--") ? "property" : /^[{}:;]$/.test(part) ? "operator" : /^\d/.test(part) ? "number" : "plain"
      : part.startsWith("//") || part.startsWith("/*") ? "comment" : part.startsWith("'") || part.startsWith('"') || part.startsWith("`") ? "string" : /^\d/.test(part) ? "number" : /^(true|false|null|undefined)$/.test(part) ? "literal" : /^(const|let|var|return|import|from|export|default|function|async|await|if|else|new|type|interface|extends)$/.test(part) ? "keyword" : "plain";
    return token === "plain" ? escapeHtml(part) : `<span class="code-token code-token-${token}" data-token="${index}">${escapeHtml(part)}</span>`;
  }).join("");
}

function SyntaxCodeEditor({ file, source, disabled, onChange, placeholder }: { file: string; source: string; disabled: boolean; onChange: (value: string) => void; placeholder: string }) {
  const highlightRef = useRef<HTMLPreElement>(null);
  return <div className="studio-syntax-editor"><pre ref={highlightRef} aria-hidden="true" dangerouslySetInnerHTML={{ __html: highlightedSource(source || placeholder, file) }} /><textarea aria-label={`Source for ${file}`} spellCheck={false} value={source} disabled={disabled} onScroll={(event) => { if (highlightRef.current) { highlightRef.current.scrollTop = event.currentTarget.scrollTop; highlightRef.current.scrollLeft = event.currentTarget.scrollLeft; } }} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></div>;
}

function OperationsDashboard({ section, documents, siteEvents, submissions, assets, auditEvents, members, notice, canManageInbox, onDeleteSubmission, onStudioTheme }: { section: AdminSection; documents: CmsDocument[]; siteEvents: SiteEvent[]; submissions: FormSubmission[]; assets: Array<MediaAsset & { publicUrl: string }>; auditEvents: AuditEvent[]; members: WorkspaceMemberRecord[]; notice: string; canManageInbox: boolean; onDeleteSubmission: (id: string) => void; onStudioTheme: (theme: "dark" | "light") => void }) {
  const labels: Record<AdminSection, [string, string]> = {
    overview: ["Operational overview", "Live CMS, visits and publishing activity from your Tony Consults workspace."], content: ["Pages", ""], code: ["Code workspace", ""], projects: ["Projects", ""], services: ["Services", ""], inbox: ["Enquiry inbox", "Form submissions with assignment and status tracking."], assets: ["Asset library", "Workspace-scoped media with searchable metadata."], analytics: ["Visitor analytics", "Optional, consent-based page visits from the public website."], users: ["People and access", "Invite administrators and assign capabilities without sharing credentials."], publish: ["Release control", "Review draft changes and publish from an auditable state."], audit: ["Audit trail", "An immutable record of important administrative actions."], settings: ["Workspace settings", "Brand, integrations, SEO and delivery configuration."],
  };
  if (section === "settings") return <ThemeSettings document={documents.find((document) => document.kind === "site_settings") ?? null} onStudioTheme={onStudioTheme} />;
  const [title, body] = labels[section];
  const published = documents.filter((document) => document.status === "published").length;
  const drafts = documents.filter((document) => document.status === "draft" || document.status === "review").length;
  const uniqueVisitors = new Set(siteEvents.map((event) => event.visitor_id)).size;
  const cards = section === "analytics" ? [[String(siteEvents.length), "Recorded page views"], [String(uniqueVisitors), "Anonymous visitors"], [String(new Set(siteEvents.map((event) => event.page_path)).size), "Pages visited"], [siteEvents[0] ? new Date(siteEvents[0].created_at).toLocaleDateString() : "No data", "Latest visit"]] : section === "inbox" ? [[String(submissions.length), "All enquiries"], [String(submissions.filter((item) => item.status === "new").length), "New enquiries"], [String(submissions.filter((item) => item.status === "in_progress").length), "In progress"], [String(submissions.filter((item) => item.status === "resolved").length), "Resolved"]] : section === "assets" ? [[String(assets.length), "Uploaded assets"], [String(assets.filter((asset) => asset.mime_type.startsWith("image/")).length), "Images"], [String(Math.round(assets.reduce((total, asset) => total + asset.size_bytes, 0) / 1024)), "KB in library"], [assets[0] ? new Date(assets[0].created_at).toLocaleDateString() : "No data", "Latest upload"]] : section === "users" ? [[String(members.length), "Workspace members"], [String(members.filter((item) => item.role === "owner").length), "Owners"], [String(members.filter((item) => item.role === "admin").length), "Administrators"], [String(members.filter((item) => item.status === "active").length), "Active accounts"]] : section === "audit" ? [[String(auditEvents.length), "Recorded events"], [String(auditEvents.filter((item) => item.action.startsWith("document.")).length), "Content events"], [String(auditEvents.filter((item) => item.action === "site.page_view").length), "Visit events"], [auditEvents[0] ? new Date(auditEvents[0].created_at).toLocaleDateString() : "No data", "Latest event"]] : [[String(published), "Published records"], [String(drafts), "Draft changes"], [String(siteEvents.length), "Consent-based views"], [String(uniqueVisitors), "Anonymous visitors"]];
  const popularPages = [...siteEvents].reduce<Record<string, number>>((counts, event) => ({ ...counts, [event.page_path]: (counts[event.page_path] ?? 0) + 1 }), {});
  const activity = section === "inbox" ? submissions.map((item) => ({ id: item.id, title: String(item.payload.name ?? item.payload.email ?? item.form_key), detail: `${item.status} - ${new Date(item.created_at).toLocaleString()}` })) : section === "users" ? members.map((item) => ({ id: item.user_id, title: item.profiles?.display_name ?? item.user_id, detail: `${item.role} - ${item.status}` })) : section === "audit" ? auditEvents.map((item) => ({ id: String(item.id), title: item.action.replaceAll(".", " "), detail: `${item.entity_type} - ${new Date(item.created_at).toLocaleString()}` })) : documents.map((item) => ({ id: item.id, title: item.title, detail: `Updated ${new Date(item.updated_at).toLocaleString()}` }));
  const activityTitle = section === "analytics" ? "Page interest" : section === "inbox" ? "Latest enquiries" : section === "users" ? "People and access" : section === "audit" ? "Latest audit events" : "Recent changes";
  return <div className="studio-operations"><div className="studio-editor-heading"><div><small>Workspace</small><h1>{title}</h1><p>{body}</p></div><button className="studio-button secondary" type="button" onClick={() => window.location.reload()}><Cloud /> Refresh</button></div>{notice ? <p className="studio-inline-notice" role="status">{notice}</p> : null}<div className="studio-metric-grid">{cards.map(([value, label]) => <article key={label}><span>{label}</span><strong>{value}</strong><i /></article>)}</div>{section === "assets" ? <section className="studio-assets-grid">{assets.length ? assets.map((asset) => <article key={asset.id}><a href={asset.publicUrl} target="_blank" rel="noreferrer"><img src={asset.publicUrl} alt={asset.alt_text || asset.filename} /></a><div><strong>{asset.filename}</strong><small>{asset.mime_type} · {Math.max(1, Math.round(asset.size_bytes / 1024))} KB</small><small>Uploaded {new Date(asset.created_at).toLocaleString()}</small></div></article>) : <EmptyState title="No uploaded assets" body="Images uploaded from a project block will appear here." />}</section> : section === "inbox" ? <section className="studio-inbox-list">{submissions.length ? submissions.map((submission) => <article key={submission.id}><header><div><small>{submission.form_key} enquiry</small><strong>{String(submission.payload.name ?? "Website visitor")}</strong></div><div className="studio-inbox-actions"><span className={`studio-pill status-${submission.status}`}>{submission.status.replace("_", " ")}</span>{canManageInbox ? <button className="studio-icon studio-delete-button" type="button" title="Delete enquiry" aria-label="Delete enquiry" onClick={() => onDeleteSubmission(submission.id)}><Trash2 /></button> : null}</div></header><a href={`mailto:${String(submission.payload.email ?? "")}`}>{String(submission.payload.email ?? "No email provided")}</a>{submission.payload.phone ? <a href={`tel:${String(submission.payload.phone)}`}>{String(submission.payload.phone)}</a> : null}{submission.payload.company ? <p><b>Organisation:</b> {String(submission.payload.company)}</p> : null}<p>{String(submission.payload.message ?? "No message provided")}</p><footer>Submitted {new Date(submission.created_at).toLocaleString()}</footer></article>) : <EmptyState title="No enquiries yet" body="New contact-form submissions will appear here automatically." />}</section> : <div className="studio-operations-grid"><section><div className="studio-section-heading"><div><small>{section === "analytics" ? "Most visited" : "Live workspace data"}</small><h2>{activityTitle}</h2></div><Activity /></div>{section === "analytics" ? Object.entries(popularPages).sort(([, a], [, b]) => b - a).slice(0, 3).map(([path, visits]) => <div className="studio-activity-row" key={path}><span><BarChart3 /></span><div><strong>{path}</strong><small>{visits} recorded view{visits === 1 ? "" : "s"}</small></div></div>) : activity.slice(0, 5).map((item) => <div className="studio-activity-row" key={item.id}><span><Check /></span><div><strong>{item.title}</strong><small>{item.detail}</small></div></div>)}</section><section><div className="studio-section-heading"><div><small>Release</small><h2>Publishing health</h2></div><Rocket /></div><div className="studio-release-card"><span><ShieldCheck /></span><strong>{published} public records are ready</strong><p>Published CMS projects and services are generated as public static pages on the next GitHub Pages build. Analytics begin only when a visitor accepts optional cookies.</p></div></section></div>}</div>;
}

function ThemeSettings({ document, onStudioTheme }: { document: CmsDocument | null; onStudioTheme: (theme: "dark" | "light") => void }) {
  const initialTheme = document?.draft_body.theme === "light" ? "light" : "dark";
  const [theme, setTheme] = useState<"dark" | "light">(initialTheme);
  const [nicheQuestion, setNicheQuestion] = useState(String(document?.draft_body.nicheQuestion ?? "What is my reference to you?"));
  const [nichePassword, setNichePassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const selectTheme = (nextTheme: "dark" | "light") => { setTheme(nextTheme); onStudioTheme(nextTheme); };
  const save = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !document) return;
    setSaving(true); setMessage("");
    const { data, error } = await supabase.functions.invoke("studio-cms", { body: { action: "save-document", id: document.id, version: document.version, title: document.title, slug: document.slug, draft_body: { ...(document.draft_body ?? {}), theme, nicheQuestion: nicheQuestion.trim() || "What is my reference to you?" }, publish: true } });
    if (!error && data?.ok && nichePassword.trim()) {
      const passwordBytes = new TextEncoder().encode(nichePassword.trim().toLowerCase());
      const passwordDigest = await crypto.subtle.digest("SHA-256", passwordBytes);
      const nichePasswordHash = Array.from(new Uint8Array(passwordDigest), (byte) => byte.toString(16).padStart(2, "0")).join("");
      const { data: workspace } = await supabase.from("workspaces").select("settings").eq("id", document.workspace_id).maybeSingle();
      const { error: workspaceError } = await supabase.from("workspaces").update({ settings: { ...(workspace?.settings ?? {}), niche_password_hash: nichePasswordHash } }).eq("id", document.workspace_id);
      if (workspaceError) { setSaving(false); setMessage(workspaceError.message); return; }
      setNichePassword("");
    }
    setSaving(false);
    setMessage(error?.message ?? data?.error ?? (data?.ok ? "Settings saved. The private page question is live and its answer remains protected." : "Settings could not be saved."));
  };
  return <div className="studio-operations"><div className="studio-editor-heading"><div><small>Workspace settings</small><h1>Site-wide settings</h1><p>Choose the public theme and control the private Niche page without placing its answer in page code.</p></div></div><section className="studio-theme-settings"><header><strong>Default public website appearance</strong><p>Dark and light image variants in every CMS block respond to this setting automatically.</p></header><div className="studio-theme-options"><button className={`studio-theme-option${theme === "dark" ? " active" : ""}`} type="button" onClick={() => selectTheme("dark")}><Moon /><strong>Dark theme</strong><small>Deep editorial background and dark-mode image assets.</small></button><button className={`studio-theme-option${theme === "light" ? " active" : ""}`} type="button" onClick={() => selectTheme("light")}><Sun /><strong>Light theme</strong><small>Bright paper surfaces and light-mode image assets.</small></button></div><div className="studio-private-page-settings"><small>Private page</small><strong>Niche unlock</strong><label>Unlock question<input value={nicheQuestion} onChange={(event) => setNicheQuestion(event.target.value)} /></label><label>New unlock answer<input type="password" autoComplete="new-password" value={nichePassword} onChange={(event) => setNichePassword(event.target.value)} placeholder="Leave empty to keep the current answer" /></label><p>The question is shown at <code>/niche/</code>. Only a SHA-256 hash of a new answer is stored in private workspace settings.</p></div><footer><span>{message || (document ? "Save to publish your changes." : "The settings document is not available yet.")}</span><button className="studio-button primary" type="button" disabled={!document || saving} onClick={() => void save()}>{saving ? <LoaderCircle className="spin" /> : <Save />} Save settings</button></footer></section></div>;
}

function Inspector({ document, membership, connection }: { document: CmsDocument | null; membership: WorkspaceMembership | null; connection: ConnectionState }) {
  return <div className="studio-inspector-content"><section><small>Access</small><div className="studio-inspector-row"><span>Role</span><strong>{membership?.role ?? (connection === "setup" ? "Preview" : "None")}</strong></div><div className="studio-inspector-row"><span>Mode</span><strong>{connection === "ready" ? "Connected" : "Read only"}</strong></div></section>{document ? <section><small>Document</small><div className="studio-inspector-row"><span>Type</span><strong>{document.kind}</strong></div><div className="studio-inspector-row"><span>Status</span><strong>{document.status}</strong></div><div className="studio-inspector-row"><span>Version</span><strong>{document.version}</strong></div><div className="studio-inspector-row"><span>Schema</span><strong>v{document.schema_version}</strong></div></section> : null}<section><small>Capabilities</small>{["page.read", "page.edit", "page.publish", "asset.manage", "form.read"].map((capability) => <div className="studio-capability" key={capability}><span>{capability}</span>{hasCapability(membership, capability) ? <Check /> : <LockKeyhole />}</div>)}</section><section className="studio-inspector-note"><ShieldCheck /><div><strong>Least privilege</strong><p>Permissions come from workspace membership, never editable profile metadata.</p></div></section></div>;
}

function SectionSummary({ section, documents }: { section: AdminSection; documents: CmsDocument[] }) {
  return <div className="studio-summary-list"><span><strong>{documents.filter((item) => item.status === "published").length}</strong><small>Published</small></span><span><strong>{documents.filter((item) => item.status === "draft").length}</strong><small>Drafts</small></span><span><strong>{section === "inbox" ? "0" : "Healthy"}</strong><small>{section === "inbox" ? "Unread" : "Status"}</small></span></div>;
}

function EmptyState({ compact = false, title, body }: { compact?: boolean; title: string; body: string }) { return <div className={compact ? "studio-empty compact" : "studio-empty"}><Archive /><strong>{title}</strong><p>{body}</p></div>; }
function CenteredState({ icon: Icon, spin = false, title, body }: { icon: typeof LoaderCircle; spin?: boolean; title: string; body: string }) { return <div className="studio-centered"><Icon className={spin ? "spin" : ""} /><h1>{title}</h1><p>{body}</p></div>; }
