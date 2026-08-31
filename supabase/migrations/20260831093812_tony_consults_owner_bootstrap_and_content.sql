-- A short allow-list lets the legitimate owner establish the first account
-- without making the first arbitrary sign-up an administrator.
create table public.admin_bootstrap_invites (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null check (email = lower(email)),
  role public.workspace_role not null default 'owner',
  capabilities text[] not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (workspace_id, email)
);

alter table public.admin_bootstrap_invites enable row level security;

insert into public.admin_bootstrap_invites (workspace_id, email, role, capabilities)
values (
  '7ec3d48f-4435-4fd8-9651-2e0739c8cdd3',
  'antonymburu379@gmail.com',
  'owner',
  array['page.read', 'page.edit', 'page.publish', 'asset.manage', 'form.read', 'form.manage', 'user.manage', 'audit.read', 'integration.manage']
)
on conflict (workspace_id, email) do update
set role = excluded.role, capabilities = excluded.capabilities, active = true;

create or replace function private.provision_tony_consults_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite public.admin_bootstrap_invites%rowtype;
begin
  select * into invite
  from public.admin_bootstrap_invites
  where email = lower(new.email)
    and active = true
  limit 1;

  if found then
    insert into public.profiles (id, display_name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Tony Consults administrator'))
    on conflict (id) do nothing;

    insert into public.workspace_memberships (workspace_id, user_id, role, status, capabilities)
    values (invite.workspace_id, new.id, invite.role, 'active', invite.capabilities)
    on conflict (workspace_id, user_id) do update
    set role = excluded.role,
        status = excluded.status,
        capabilities = excluded.capabilities;
  end if;

  return new;
end;
$$;

revoke all on function private.provision_tony_consults_owner() from public, anon, authenticated;

drop trigger if exists provision_tony_consults_owner_on_signup on auth.users;
create trigger provision_tony_consults_owner_on_signup
after insert on auth.users
for each row execute function private.provision_tony_consults_owner();

-- Covers the case where the allow-listed owner was created before this migration.
insert into public.profiles (id, display_name)
select id, coalesce(raw_user_meta_data ->> 'display_name', 'Tony Consults administrator')
from auth.users
where lower(email) = 'antonymburu379@gmail.com'
on conflict (id) do nothing;

insert into public.workspace_memberships (workspace_id, user_id, role, status, capabilities)
select
  invite.workspace_id,
  users.id,
  invite.role,
  'active',
  invite.capabilities
from auth.users users
join public.admin_bootstrap_invites invite on invite.email = lower(users.email) and invite.active = true
on conflict (workspace_id, user_id) do update
set role = excluded.role,
    status = excluded.status,
    capabilities = excluded.capabilities;

insert into public.cms_documents (workspace_id, kind, slug, title, status, draft_body, published_body, published_at)
values
  ('7ec3d48f-4435-4fd8-9651-2e0739c8cdd3', 'page', 'home', 'Home', 'published', '{"eyebrow":"Tony Consults","summary":"Websites built for real work.","body":"The portfolio homepage, introduction, selected capabilities and contact pathways."}'::jsonb, '{"eyebrow":"Tony Consults","summary":"Websites built for real work.","body":"The portfolio homepage, introduction, selected capabilities and contact pathways."}'::jsonb, now()),
  ('7ec3d48f-4435-4fd8-9651-2e0739c8cdd3', 'page', 'about', 'About Antony', 'published', '{"eyebrow":"My journey","summary":"Engineering thinking, digital craft.","body":"Profile, journey, working standards and capabilities."}'::jsonb, '{"eyebrow":"My journey","summary":"Engineering thinking, digital craft.","body":"Profile, journey, working standards and capabilities."}'::jsonb, now()),
  ('7ec3d48f-4435-4fd8-9651-2e0739c8cdd3', 'page', 'work', 'Selected Work', 'published', '{"eyebrow":"Selected work","summary":"Built to look sharp. Made to work.","body":"Portfolio concepts and practical digital systems."}'::jsonb, '{"eyebrow":"Selected work","summary":"Built to look sharp. Made to work.","body":"Portfolio concepts and practical digital systems."}'::jsonb, now()),
  ('7ec3d48f-4435-4fd8-9651-2e0739c8cdd3', 'page', 'services', 'Services', 'published', '{"eyebrow":"Services","summary":"Tiered plans, clear upgrades.","body":"Portfolio, business and e-commerce website plans."}'::jsonb, '{"eyebrow":"Services","summary":"Tiered plans, clear upgrades.","body":"Portfolio, business and e-commerce website plans."}'::jsonb, now()),
  ('7ec3d48f-4435-4fd8-9651-2e0739c8cdd3', 'page', 'contact', 'Contact', 'published', '{"eyebrow":"Contact","summary":"Tell me what needs to work.","body":"Direct WhatsApp, email and phone enquiry routes."}'::jsonb, '{"eyebrow":"Contact","summary":"Tell me what needs to work.","body":"Direct WhatsApp, email and phone enquiry routes."}'::jsonb, now()),
  ('7ec3d48f-4435-4fd8-9651-2e0739c8cdd3', 'page', 'website-design-kenya', 'Website Design Kenya', 'published', '{"eyebrow":"Website design in Kenya","summary":"Clear, responsive sites for serious work.","body":"Local SEO service landing page."}'::jsonb, '{"eyebrow":"Website design in Kenya","summary":"Clear, responsive sites for serious work.","body":"Local SEO service landing page."}'::jsonb, now()),
  ('7ec3d48f-4435-4fd8-9651-2e0739c8cdd3', 'page', 'website-cost-kenya', 'Website Cost Guide Kenya', 'published', '{"eyebrow":"Website cost guide","summary":"Know what you are paying for.","body":"Guide to practical website costs in Kenya."}'::jsonb, '{"eyebrow":"Website cost guide","summary":"Know what you are paying for.","body":"Guide to practical website costs in Kenya."}'::jsonb, now())
on conflict (workspace_id, kind, slug) do nothing;

insert into public.cms_documents (workspace_id, kind, slug, title, status, draft_body, published_body, published_at)
values
  ('7ec3d48f-4435-4fd8-9651-2e0739c8cdd3', 'service', 'portfolio-websites', 'Portfolio Websites', 'published', '{"summary":"Personal and professional websites with a clear story and credible contact route."}'::jsonb, '{"summary":"Personal and professional websites with a clear story and credible contact route."}'::jsonb, now()),
  ('7ec3d48f-4435-4fd8-9651-2e0739c8cdd3', 'service', 'business-website-packs', 'Business Website Packs', 'published', '{"summary":"Business websites with SEO, core pages and practical enquiry flows."}'::jsonb, '{"summary":"Business websites with SEO, core pages and practical enquiry flows."}'::jsonb, now()),
  ('7ec3d48f-4435-4fd8-9651-2e0739c8cdd3', 'service', 'ecommerce-websites', 'E-commerce Websites', 'published', '{"summary":"Tiered commerce experiences with payment and mobile-app planning as needs grow."}'::jsonb, '{"summary":"Tiered commerce experiences with payment and mobile-app planning as needs grow."}'::jsonb, now())
on conflict (workspace_id, kind, slug) do nothing;
