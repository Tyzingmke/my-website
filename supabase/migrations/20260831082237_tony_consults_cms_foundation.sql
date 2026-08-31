-- Tony Consults CMS foundation.
-- Public content is readable; every administrative operation is workspace-scoped.

create extension if not exists pgcrypto;

create type public.workspace_role as enum ('owner', 'admin', 'editor', 'viewer');
create type public.membership_status as enum ('invited', 'active', 'suspended');
create type public.cms_document_kind as enum ('page', 'project', 'service', 'site_settings');
create type public.cms_document_status as enum ('draft', 'review', 'published', 'archived');
create type public.submission_status as enum ('new', 'in_progress', 'resolved', 'spam');
create type public.publish_status as enum ('queued', 'running', 'succeeded', 'failed', 'cancelled');

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  primary_domain text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_memberships (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'viewer',
  status public.membership_status not null default 'invited',
  capabilities text[] not null default '{}'::text[],
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.cms_documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kind public.cms_document_kind not null,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 180),
  status public.cms_document_status not null default 'draft',
  schema_version integer not null default 1 check (schema_version > 0),
  draft_body jsonb not null default '{}'::jsonb,
  published_body jsonb,
  version integer not null default 1 check (version > 0),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (workspace_id, kind, slug),
  check ((status <> 'published') or (published_body is not null and published_at is not null))
);

create table public.cms_revisions (
  id bigint generated always as identity primary key,
  document_id uuid not null references public.cms_documents(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  version integer not null,
  title text not null,
  slug text not null,
  status public.cms_document_status not null,
  body jsonb not null,
  changed_by uuid references auth.users(id) on delete set null,
  change_note text,
  created_at timestamptz not null default now(),
  unique (document_id, version)
);

create table public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  form_key text not null check (char_length(form_key) between 1 and 80),
  status public.submission_status not null default 'new',
  payload jsonb not null,
  assigned_to uuid references auth.users(id) on delete set null,
  source_url text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  width integer,
  height integer,
  alt_text text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (workspace_id, storage_path)
);

create table public.publish_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  status public.publish_status not null default 'queued',
  requested_by uuid references auth.users(id) on delete set null,
  base_sha text,
  content_checksum text not null,
  idempotency_key text not null,
  commit_sha text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index cms_documents_workspace_status_idx on public.cms_documents (workspace_id, status, updated_at desc);
create index cms_documents_public_idx on public.cms_documents (kind, slug) where status = 'published';
create index form_submissions_workspace_status_idx on public.form_submissions (workspace_id, status, created_at desc);
create index audit_events_workspace_created_idx on public.audit_events (workspace_id, created_at desc);
create index media_assets_workspace_created_idx on public.media_assets (workspace_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger workspaces_set_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger memberships_set_updated_at before update on public.workspace_memberships for each row execute function public.set_updated_at();
create trigger documents_set_updated_at before update on public.cms_documents for each row execute function public.set_updated_at();
create trigger submissions_set_updated_at before update on public.form_submissions for each row execute function public.set_updated_at();

create or replace function public.stamp_document_actor()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by = coalesce(new.created_by, (select auth.uid()));
  end if;
  new.updated_by = (select auth.uid());
  return new;
end;
$$;

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_memberships membership
    where membership.workspace_id = target_workspace
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
  );
$$;

create or replace function public.has_workspace_capability(target_workspace uuid, requested_capability text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_memberships membership
    where membership.workspace_id = target_workspace
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and (
        membership.role in ('owner', 'admin')
        or requested_capability = any(membership.capabilities)
      )
  );
$$;

revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.has_workspace_capability(uuid, text) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.has_workspace_capability(uuid, text) to authenticated;

create or replace function public.bump_document_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if row(old.title, old.slug, old.status, old.draft_body) is distinct from row(new.title, new.slug, new.status, new.draft_body) then
    new.version = old.version + 1;
  end if;
  return new;
end;
$$;

create or replace function public.capture_document_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT'
     or row(old.title, old.slug, old.status, old.draft_body) is distinct from row(new.title, new.slug, new.status, new.draft_body) then
    insert into public.cms_revisions (document_id, workspace_id, version, title, slug, status, body, changed_by)
    values (new.id, new.workspace_id, new.version, new.title, new.slug, new.status, new.draft_body, new.updated_by);
  end if;
  return new;
end;
$$;

create trigger documents_bump_version
before update on public.cms_documents
for each row execute function public.bump_document_version();

create trigger documents_stamp_actor
before insert or update on public.cms_documents
for each row execute function public.stamp_document_actor();

create trigger documents_capture_revision
after insert or update on public.cms_documents
for each row execute function public.capture_document_revision();

alter table public.workspaces enable row level security;
alter table public.profiles enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.cms_documents enable row level security;
alter table public.cms_revisions enable row level security;
alter table public.form_submissions enable row level security;
alter table public.media_assets enable row level security;
alter table public.publish_jobs enable row level security;
alter table public.audit_events enable row level security;

create policy "members read workspaces" on public.workspaces for select to authenticated using (public.is_workspace_member(id));
create policy "admins update workspaces" on public.workspaces for update to authenticated using (public.has_workspace_capability(id, 'integration.manage')) with check (public.has_workspace_capability(id, 'integration.manage'));

create policy "users read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "members read memberships" on public.workspace_memberships for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "admins create memberships" on public.workspace_memberships for insert to authenticated with check (public.has_workspace_capability(workspace_id, 'user.manage'));
create policy "admins update memberships" on public.workspace_memberships for update to authenticated using (public.has_workspace_capability(workspace_id, 'user.manage')) with check (public.has_workspace_capability(workspace_id, 'user.manage'));
create policy "owners remove memberships" on public.workspace_memberships for delete to authenticated using (public.has_workspace_capability(workspace_id, 'user.manage'));

create policy "public reads published documents" on public.cms_documents for select to anon using (status = 'published' and published_body is not null);
create policy "members read documents" on public.cms_documents for select to authenticated using (public.has_workspace_capability(workspace_id, 'page.read'));
create policy "editors create documents" on public.cms_documents for insert to authenticated with check (public.has_workspace_capability(workspace_id, 'page.edit'));
create policy "editors update documents" on public.cms_documents for update to authenticated using (public.has_workspace_capability(workspace_id, 'page.edit')) with check (
  public.has_workspace_capability(workspace_id, 'page.edit')
  and (status <> 'published' or public.has_workspace_capability(workspace_id, 'page.publish'))
);
create policy "editors archive documents" on public.cms_documents for delete to authenticated using (public.has_workspace_capability(workspace_id, 'page.edit'));

create policy "members read revisions" on public.cms_revisions for select to authenticated using (public.has_workspace_capability(workspace_id, 'page.read'));
create policy "members read submissions" on public.form_submissions for select to authenticated using (public.has_workspace_capability(workspace_id, 'form.read'));
create policy "members update submissions" on public.form_submissions for update to authenticated using (public.has_workspace_capability(workspace_id, 'form.manage')) with check (public.has_workspace_capability(workspace_id, 'form.manage'));

create policy "members read assets" on public.media_assets for select to authenticated using (public.has_workspace_capability(workspace_id, 'asset.manage'));
create policy "members create assets" on public.media_assets for insert to authenticated with check (public.has_workspace_capability(workspace_id, 'asset.manage'));
create policy "members update assets" on public.media_assets for update to authenticated using (public.has_workspace_capability(workspace_id, 'asset.manage')) with check (public.has_workspace_capability(workspace_id, 'asset.manage'));
create policy "members delete assets" on public.media_assets for delete to authenticated using (public.has_workspace_capability(workspace_id, 'asset.manage'));

create policy "publishers read jobs" on public.publish_jobs for select to authenticated using (public.has_workspace_capability(workspace_id, 'page.publish'));
create policy "publishers create jobs" on public.publish_jobs for insert to authenticated with check (public.has_workspace_capability(workspace_id, 'page.publish'));
create policy "auditors read events" on public.audit_events for select to authenticated using (public.has_workspace_capability(workspace_id, 'audit.read'));

grant usage on schema public to anon, authenticated;
grant select on public.cms_documents to anon;
grant select on public.workspaces, public.profiles, public.workspace_memberships, public.cms_documents, public.cms_revisions, public.form_submissions, public.media_assets, public.publish_jobs, public.audit_events to authenticated;
grant insert, update, delete on public.workspace_memberships, public.cms_documents, public.form_submissions, public.media_assets to authenticated;
grant insert on public.publish_jobs to authenticated;
grant usage, select on all sequences in schema public to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-assets',
  'portfolio-assets',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do nothing;

create policy "public reads portfolio assets"
on storage.objects for select to anon, authenticated
using (bucket_id = 'portfolio-assets');

create policy "asset managers upload portfolio assets"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'portfolio-assets'
  and public.has_workspace_capability(((storage.foldername(name))[1])::uuid, 'asset.manage')
);

create policy "asset managers update portfolio assets"
on storage.objects for update to authenticated
using (
  bucket_id = 'portfolio-assets'
  and public.has_workspace_capability(((storage.foldername(name))[1])::uuid, 'asset.manage')
)
with check (
  bucket_id = 'portfolio-assets'
  and public.has_workspace_capability(((storage.foldername(name))[1])::uuid, 'asset.manage')
);

create policy "asset managers delete portfolio assets"
on storage.objects for delete to authenticated
using (
  bucket_id = 'portfolio-assets'
  and public.has_workspace_capability(((storage.foldername(name))[1])::uuid, 'asset.manage')
);

-- Seed only the tenant, never an administrator. Add the first owner by auth user ID
-- from the Supabase SQL editor after inviting the account.
insert into public.workspaces (id, name, slug, primary_domain)
values ('7ec3d48f-4435-4fd8-9651-2e0739c8cdd3', 'Tony Consults', 'tony-consults', 'www.tonyconsults.co.ke')
on conflict (slug) do nothing;
