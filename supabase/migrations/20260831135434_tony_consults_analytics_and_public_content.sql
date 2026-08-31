create type public.site_event_type as enum ('page_view');

create table public.site_events (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event_type public.site_event_type not null default 'page_view',
  page_path text not null check (page_path ~ '^/[a-z0-9/-]*$'),
  visitor_id uuid not null,
  created_at timestamptz not null default now()
);

create index site_events_workspace_created_idx on public.site_events (workspace_id, created_at desc);
create index site_events_workspace_path_idx on public.site_events (workspace_id, page_path, created_at desc);

alter table public.site_events enable row level security;

grant insert on public.site_events to anon;
grant select on public.site_events to authenticated;

create policy "consenting visitors record page views"
on public.site_events for insert to anon
with check (
  workspace_id = '7ec3d48f-4435-4fd8-9651-2e0739c8cdd3'
  and event_type = 'page_view'
);

create policy "members read site analytics"
on public.site_events for select to authenticated
using (public.has_workspace_capability(workspace_id, 'audit.read'));
