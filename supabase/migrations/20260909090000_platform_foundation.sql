-- Fresh Tony Consults Platform foundation. All application data lives under
-- platform_* names so this migration can coexist safely while the old system is retired.
create type public.platform_role as enum ('owner', 'admin', 'staff', 'seller', 'blogger', 'client');
create type public.platform_ticket_status as enum ('new', 'open', 'waiting_on_client', 'resolved', 'closed');
create type public.platform_content_status as enum ('draft', 'review', 'published', 'archived');
create type public.platform_order_status as enum ('pending', 'paid', 'fulfilled', 'refunded', 'cancelled');

create table public.platform_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.platform_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_path text,
  phone_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.platform_memberships (
  workspace_id uuid not null references public.platform_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.platform_role not null default 'client',
  capabilities text[] not null default '{}',
  status text not null default 'active' check (status in ('invited', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.platform_content (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.platform_workspaces(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  kind text not null check (kind in ('page', 'project', 'post', 'service', 'theme')),
  title text not null,
  slug text not null,
  summary text,
  body jsonb not null default '{}'::jsonb,
  status public.platform_content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, kind, slug)
);

create table public.platform_products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.platform_workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id),
  title text not null,
  slug text not null,
  description text,
  price_kes integer not null check (price_kes >= 0),
  storage_path text,
  status public.platform_content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

create table public.platform_tickets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.platform_workspaces(id) on delete cascade,
  client_id uuid references auth.users(id),
  assigned_to uuid references auth.users(id),
  subject text not null,
  status public.platform_ticket_status not null default 'new',
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  source_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.platform_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.platform_tickets(id) on delete cascade,
  sender_id uuid references auth.users(id),
  body text not null,
  attachment_paths text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.platform_orders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.platform_workspaces(id) on delete cascade,
  buyer_id uuid not null references auth.users(id),
  product_id uuid not null references public.platform_products(id),
  payment_reference text unique,
  status public.platform_order_status not null default 'pending',
  amount_kes integer not null check (amount_kes >= 0),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.platform_audit_events (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.platform_workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index platform_content_public_idx on public.platform_content (workspace_id, kind, status, published_at desc);
create index platform_tickets_workspace_idx on public.platform_tickets (workspace_id, status, updated_at desc);
create index platform_orders_buyer_idx on public.platform_orders (buyer_id, created_at desc);

create schema if not exists private;

create or replace function private.platform_is_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.platform_memberships where workspace_id = target_workspace and user_id = (select auth.uid()) and status = 'active')
$$;

create or replace function private.platform_can(target_workspace uuid, required_capability text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.platform_memberships where workspace_id = target_workspace and user_id = (select auth.uid()) and status = 'active' and (role in ('owner', 'admin') or required_capability = any(capabilities)))
$$;

create or replace function public.platform_touch_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$ begin new.updated_at = now(); return new; end $$;

create trigger platform_profiles_touch before update on public.platform_profiles for each row execute function public.platform_touch_updated_at();
create trigger platform_content_touch before update on public.platform_content for each row execute function public.platform_touch_updated_at();
create trigger platform_products_touch before update on public.platform_products for each row execute function public.platform_touch_updated_at();
create trigger platform_tickets_touch before update on public.platform_tickets for each row execute function public.platform_touch_updated_at();

revoke all on function private.platform_is_member(uuid) from public;
revoke all on function private.platform_can(uuid, text) from public;
grant usage on schema private to authenticated;
grant execute on function private.platform_is_member(uuid), private.platform_can(uuid, text) to authenticated;

alter table public.platform_workspaces enable row level security;
alter table public.platform_profiles enable row level security;
alter table public.platform_memberships enable row level security;
alter table public.platform_content enable row level security;
alter table public.platform_products enable row level security;
alter table public.platform_tickets enable row level security;
alter table public.platform_ticket_messages enable row level security;
alter table public.platform_orders enable row level security;
alter table public.platform_audit_events enable row level security;

create policy "members read their workspace" on public.platform_workspaces for select to authenticated using ((select private.platform_is_member(id)));
create policy "members read own profile" on public.platform_profiles for select to authenticated using (id = (select auth.uid()));
create policy "members update own profile" on public.platform_profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "members read membership" on public.platform_memberships for select to authenticated using ((select private.platform_is_member(workspace_id)));
create policy "owners manage memberships" on public.platform_memberships for all to authenticated using ((select private.platform_can(workspace_id, 'people.manage'))) with check ((select private.platform_can(workspace_id, 'people.manage')));
create policy "published content is public" on public.platform_content for select using (status = 'published');
create policy "members read workspace content" on public.platform_content for select to authenticated using ((select private.platform_is_member(workspace_id)));
create policy "authors manage content" on public.platform_content for all to authenticated using ((select private.platform_can(workspace_id, 'content.write'))) with check ((select private.platform_can(workspace_id, 'content.write')));
create policy "published products are public" on public.platform_products for select using (status = 'published');
create policy "members read products" on public.platform_products for select to authenticated using ((select private.platform_is_member(workspace_id)));
create policy "sellers manage products" on public.platform_products for all to authenticated using ((select private.platform_can(workspace_id, 'products.write'))) with check ((select private.platform_can(workspace_id, 'products.write')));
create policy "clients see their tickets" on public.platform_tickets for select to authenticated using (client_id = (select auth.uid()) or (select private.platform_can(workspace_id, 'tickets.read')));
create policy "clients create tickets" on public.platform_tickets for insert to authenticated with check (client_id = (select auth.uid()) and (select private.platform_is_member(workspace_id)));
create policy "staff manage tickets" on public.platform_tickets for update to authenticated using ((select private.platform_can(workspace_id, 'tickets.write'))) with check ((select private.platform_can(workspace_id, 'tickets.write')));
create policy "ticket participants read messages" on public.platform_ticket_messages for select to authenticated using (exists(select 1 from public.platform_tickets t where t.id = ticket_id and (t.client_id = (select auth.uid()) or (select private.platform_can(t.workspace_id, 'tickets.read')))));
create policy "ticket participants send messages" on public.platform_ticket_messages for insert to authenticated with check (sender_id = (select auth.uid()) and exists(select 1 from public.platform_tickets t where t.id = ticket_id and (t.client_id = (select auth.uid()) or (select private.platform_can(t.workspace_id, 'tickets.write')))));
create policy "buyers see own orders" on public.platform_orders for select to authenticated using (buyer_id = (select auth.uid()) or (select private.platform_can(workspace_id, 'orders.read')));
create policy "staff read audit events" on public.platform_audit_events for select to authenticated using ((select private.platform_can(workspace_id, 'audit.read')));

grant select on public.platform_content, public.platform_products to anon;
grant select, insert, update, delete on public.platform_workspaces, public.platform_profiles, public.platform_memberships, public.platform_content, public.platform_products, public.platform_tickets, public.platform_ticket_messages, public.platform_orders, public.platform_audit_events to authenticated;
grant usage, select on all sequences in schema public to authenticated;
