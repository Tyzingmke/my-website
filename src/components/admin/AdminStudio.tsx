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
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { projects, services } from "@/data/site";
import type { AdminSection, CmsDocument, CmsDocumentKind, WorkspaceMembership } from "@/lib/cms/types";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type ConnectionState = "checking" | "setup" | "signed-out" | "ready" | "error";
type ViewportMode = "desktop" | "tablet" | "mobile";

const sectionItems: Array<{ id: AdminSection; label: string; icon: typeof LayoutDashboard; capability?: string }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "content", label: "Pages", icon: FileText, capability: "page.read" },
  { id: "projects", label: "Projects", icon: FolderKanban, capability: "page.read" },
  { id: "services", label: "Services", icon: Wrench, capability: "page.read" },
  { id: "inbox", label: "Inbox", icon: Inbox, capability: "form.read" },
  { id: "assets", label: "Assets", icon: Image, capability: "asset.manage" },
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

export function AdminStudio() {
  const configured = isSupabaseConfigured();
  const [connection, setConnection] = useState<ConnectionState>(configured ? "checking" : "setup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"sign-in" | "create">("sign-in");
  const [authMessage, setAuthMessage] = useState("");
  const [membership, setMembership] = useState<WorkspaceMembership | null>(null);
  const [documents, setDocuments] = useState<CmsDocument[]>(previewDocuments);
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

  async function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true);
    setAuthMessage("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: "Antony Mburu" } },
    });
    setBusy(false);
    if (error) {
      setAuthMessage(error.message);
      return;
    }
    setAuthMessage(data.session ? "Owner account created. You can sign in now." : "Check your email and confirm the account, then return here to sign in.");
    setAuthMode("sign-in");
  }

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    setMembership(null);
    setDocuments(previewDocuments);
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
    const { data, error } = await supabase
      .from("cms_documents")
      .update(payload)
      .eq("id", selected.id)
      .eq("version", selected.version)
      .select("id, workspace_id, kind, slug, title, status, schema_version, draft_body, published_body, version, updated_at, published_at")
      .single();
    setBusy(false);
    if (error) {
      setNotice(error.message.includes("0 rows") ? "This record changed elsewhere. Reload before saving." : error.message);
      return;
    }
    setDocuments((current) => current.map((document) => document.id === selected.id ? data as CmsDocument : document));
    setNotice(publish ? "Content approved in the CMS. Configure the GitHub delivery gateway before treating it as a live-site release." : "Draft saved with a new revision.");
  }

  async function createDocument() {
    const supabase = getSupabaseBrowserClient();
    const kind = kindForSection(section);
    if (!supabase || !membership || !kind || isReadOnly) return;

    setBusy(true);
    setNotice("");
    const baseTitle = kind === "page" ? "New page" : kind === "project" ? "New project" : "New service";
    const slugBase = `${kind}-${Date.now().toString(36)}`;
    const { data, error } = await supabase
      .from("cms_documents")
      .insert({
        workspace_id: membership.workspace_id,
        kind,
        title: baseTitle,
        slug: slugBase,
        draft_body: { summary: "Add a concise summary for this item." },
      })
      .select("id, workspace_id, kind, slug, title, status, schema_version, draft_body, published_body, version, updated_at, published_at")
      .single();
    setBusy(false);
    if (error) {
      setNotice(error.message);
      return;
    }
    const document = data as CmsDocument;
    setDocuments((current) => [document, ...current]);
    setSelectedId(document.id);
    setNotice("New draft created. Give it a title, URL and summary before saving.");
  }

  function chooseSection(next: AdminSection) {
    setSection(next);
    setQuery("");
    setMobileNavOpen(false);
    const kind = kindForSection(next);
    const nextDocument = documents.find((document) => !kind || document.kind === kind);
    if (nextDocument) setSelectedId(nextDocument.id);
  }

  return (
    <div className={`tony-studio studio-theme-${theme}`} data-connection={connection}>
      <header className="studio-commandbar">
        <div className="studio-command-brand">
          <button className="studio-icon mobile-only" type="button" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu /></button>
          <span className="studio-mark" aria-hidden="true">TC</span>
          <span><small>Studio</small><strong>{workspaceName}</strong></span>
        </div>
        <div className="studio-command-center">
          <button className="studio-icon" type="button" aria-label={leftOpen ? "Close navigator" : "Open navigator"} onClick={() => setLeftOpen((value) => !value)}><PanelLeftClose /></button>
          <span className={`studio-status status-${connection}`}><i />{connection === "ready" ? "Synced" : connection === "setup" ? "Setup needed" : connection === "signed-out" ? "Signed out" : connection === "checking" ? "Connecting" : "Attention"}</span>
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
          {connection === "signed-out" || connection === "error" ? <LoginState email={email} password={password} message={authMessage} busy={busy} mode={authMode} onEmail={setEmail} onPassword={setPassword} onSubmit={authMode === "sign-in" ? handleSignIn : handleCreateAccount} onModeChange={setAuthMode} /> : null}
          {connection === "ready" || connection === "setup" ? <StudioCanvas section={section} document={selected} viewport={viewport} readOnly={isReadOnly} notice={notice} onUpdate={updateSelected} onSave={() => void saveSelected(false)} onPublish={() => void saveSelected(true)} /> : null}
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

function LoginState({ email, password, message, busy, mode, onEmail, onPassword, onSubmit, onModeChange }: { email: string; password: string; message: string; busy: boolean; mode: "sign-in" | "create"; onEmail: (value: string) => void; onPassword: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onModeChange: (mode: "sign-in" | "create") => void }) {
  const creating = mode === "create";
  return <div className="studio-auth-wrap"><form className="studio-auth-card" onSubmit={onSubmit}><span className="studio-auth-icon"><LockKeyhole /></span><small>Private workspace</small><h1>{creating ? "Create your owner access" : "Tony Consults Studio"}</h1><p>{creating ? "Only the approved Tony Consults owner email is granted administration. Other sign-ups cannot access this workspace." : "Sign in with your owner or invited administrator account."}</p><label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => onEmail(event.target.value)} required /></label><label>Password<input type="password" minLength={8} autoComplete={creating ? "new-password" : "current-password"} value={password} onChange={(event) => onPassword(event.target.value)} required /></label>{message ? <div className="studio-alert">{message}</div> : null}<button className="studio-button primary wide" disabled={busy}>{busy ? <LoaderCircle className="spin" /> : <ShieldCheck />}{creating ? "Create owner account" : "Sign in securely"}</button><button className="studio-text-button" type="button" onClick={() => { onModeChange(creating ? "sign-in" : "create"); }}>{creating ? "I already have an account" : "Create owner account"}</button></form></div>;
}

function StudioCanvas({ section, document, viewport, readOnly, notice, onUpdate, onSave, onPublish }: { section: AdminSection; document: CmsDocument | null; viewport: ViewportMode; readOnly: boolean; notice: string; onUpdate: (field: "title" | "slug" | "summary" | "body", value: string) => void; onSave: () => void; onPublish: () => void }) {
  const editorial = kindForSection(section);
  if (!editorial) return <OperationsDashboard section={section} />;
  if (!document) return <CenteredState icon={Archive} title="Nothing selected" body="Choose a record from the navigator or create a new one." />;
  return <div className="studio-editor"><div className="studio-editor-heading"><div><small>{document.kind} editor</small><h1>{document.title}</h1></div><div className="studio-editor-actions"><span className={`studio-pill status-${document.status}`}>{document.status}</span><button className="studio-button secondary" disabled={readOnly} onClick={onSave}><Save /> Save draft</button><button className="studio-button primary" disabled={readOnly} onClick={onPublish}><Rocket /> Publish</button></div></div>{notice ? <div className="studio-notice"><Check />{notice}</div> : null}<div className={`studio-preview-frame viewport-${viewport}`}><div className="studio-preview-toolbar"><i /><i /><i /><span>tonyconsults.co.ke/{document.slug}</span></div><article className="studio-page-preview"><span>{String(document.draft_body.eyebrow ?? document.kind)}</span><h2>{document.title}</h2><p>{String(document.draft_body.summary ?? "Add a concise description in the inspector fields below.")}</p><div className="studio-preview-media"><span>Live composition preview</span></div></article></div><section className="studio-fields"><div className="studio-section-heading"><div><small>Content</small><h2>Core fields</h2></div><span>Version {document.version}</span></div><div className="studio-field-grid"><label>Title<input value={document.title} disabled={readOnly} onChange={(event) => onUpdate("title", event.target.value)} /></label><label>URL slug<input value={document.slug} disabled={readOnly} onChange={(event) => onUpdate("slug", event.target.value)} /></label><label className="field-wide">Summary<textarea rows={3} value={String(document.draft_body.summary ?? "")} disabled={readOnly} onChange={(event) => onUpdate("summary", event.target.value)} /></label><label className="field-wide">Body<textarea rows={8} value={String(document.draft_body.body ?? "")} disabled={readOnly} onChange={(event) => onUpdate("body", event.target.value)} /></label></div></section></div>;
}

function OperationsDashboard({ section }: { section: AdminSection }) {
  const labels: Record<AdminSection, [string, string]> = {
    overview: ["Operational overview", "Content, enquiries and publishing health in one calm view."], content: ["Pages", ""], projects: ["Projects", ""], services: ["Services", ""], inbox: ["Enquiry inbox", "Form submissions with assignment and status tracking."], assets: ["Asset library", "Workspace-scoped media with searchable metadata."], users: ["People and access", "Invite administrators and assign capabilities without sharing credentials."], publish: ["Release control", "Review draft changes and publish from an auditable state."], audit: ["Audit trail", "An immutable record of important administrative actions."], settings: ["Workspace settings", "Brand, integrations, SEO and delivery configuration."],
  };
  const [title, body] = labels[section];
  const cards = section === "overview" ? [["12", "Published records"], ["3", "Draft changes"], ["0", "Failed releases"], ["100%", "Policy coverage"]] : [["Ready", "Database schema"], ["RLS", "Access control"], ["Tracked", "Audit events"], ["Scoped", "Workspace data"]];
  return <div className="studio-operations"><div className="studio-editor-heading"><div><small>Workspace</small><h1>{title}</h1><p>{body}</p></div><button className="studio-button secondary"><Cloud /> Refresh</button></div><div className="studio-metric-grid">{cards.map(([value, label]) => <article key={label}><span>{label}</span><strong>{value}</strong><i /></article>)}</div><div className="studio-operations-grid"><section><div className="studio-section-heading"><div><small>Activity</small><h2>Recent changes</h2></div><Activity /></div>{["Homepage content reviewed", "Service package draft updated", "Portfolio project published"].map((item, index) => <div className="studio-activity-row" key={item}><span><Check /></span><div><strong>{item}</strong><small>{index + 1} day{index ? "s" : ""} ago</small></div></div>)}</section><section><div className="studio-section-heading"><div><small>Release</small><h2>Publishing health</h2></div><Rocket /></div><div className="studio-release-card"><span><ShieldCheck /></span><strong>Delivery foundation ready</strong><p>Connect the dedicated Supabase project, add your owner membership, then publishing and revision history become live.</p></div></section></div></div>;
}

function Inspector({ document, membership, connection }: { document: CmsDocument | null; membership: WorkspaceMembership | null; connection: ConnectionState }) {
  return <div className="studio-inspector-content"><section><small>Access</small><div className="studio-inspector-row"><span>Role</span><strong>{membership?.role ?? (connection === "setup" ? "Preview" : "None")}</strong></div><div className="studio-inspector-row"><span>Mode</span><strong>{connection === "ready" ? "Connected" : "Read only"}</strong></div></section>{document ? <section><small>Document</small><div className="studio-inspector-row"><span>Type</span><strong>{document.kind}</strong></div><div className="studio-inspector-row"><span>Status</span><strong>{document.status}</strong></div><div className="studio-inspector-row"><span>Version</span><strong>{document.version}</strong></div><div className="studio-inspector-row"><span>Schema</span><strong>v{document.schema_version}</strong></div></section> : null}<section><small>Capabilities</small>{["page.read", "page.edit", "page.publish", "asset.manage", "form.read"].map((capability) => <div className="studio-capability" key={capability}><span>{capability}</span>{hasCapability(membership, capability) ? <Check /> : <LockKeyhole />}</div>)}</section><section className="studio-inspector-note"><ShieldCheck /><div><strong>Least privilege</strong><p>Permissions come from workspace membership, never editable profile metadata.</p></div></section></div>;
}

function SectionSummary({ section, documents }: { section: AdminSection; documents: CmsDocument[] }) {
  return <div className="studio-summary-list"><span><strong>{documents.filter((item) => item.status === "published").length}</strong><small>Published</small></span><span><strong>{documents.filter((item) => item.status === "draft").length}</strong><small>Drafts</small></span><span><strong>{section === "inbox" ? "0" : "Healthy"}</strong><small>{section === "inbox" ? "Unread" : "Status"}</small></span></div>;
}

function EmptyState({ compact = false, title, body }: { compact?: boolean; title: string; body: string }) { return <div className={compact ? "studio-empty compact" : "studio-empty"}><Archive /><strong>{title}</strong><p>{body}</p></div>; }
function CenteredState({ icon: Icon, spin = false, title, body }: { icon: typeof LoaderCircle; spin?: boolean; title: string; body: string }) { return <div className="studio-centered"><Icon className={spin ? "spin" : ""} /><h1>{title}</h1><p>{body}</p></div>; }
