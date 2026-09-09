-- Tony Consults core: the only backend slice required before the first frontend shell.
create schema if not exists private;
create table if not exists public.tc_roles (id text primary key check (id in ('admin', 'staff', 'seller', 'blogger', 'client')), label text not null);
insert into public.tc_roles (id, label) values ('admin', 'Administrator'), ('staff', 'Staff'), ('seller', 'Seller'), ('blogger', 'Blogger'), ('client', 'Client') on conflict (id) do update set label = excluded.label;

create table if not exists public.tc_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id text not null default 'client' references public.tc_roles(id),
  display_name text, bio text, avatar_url text, social_links jsonb not null default '{}'::jsonb,
  phone_verified boolean not null default false, totp_enabled boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.tc_permissions (
  id uuid primary key default gen_random_uuid(), role_id text not null references public.tc_roles(id) on delete cascade,
  resource text not null, can_read boolean not null default false, can_write boolean not null default false, can_delete boolean not null default false,
  unique (role_id, resource)
);
insert into public.tc_profiles (id, display_name)
select id, coalesce(nullif(raw_user_meta_data ->> 'display_name', ''), split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;
alter table public.tc_roles enable row level security;
alter table public.tc_profiles enable row level security;
alter table public.tc_permissions enable row level security;

create or replace function public.tc_create_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.tc_profiles (id, display_name) values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))) on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists tc_create_profile_after_signup on auth.users;
create trigger tc_create_profile_after_signup after insert on auth.users for each row execute function public.tc_create_profile();

create or replace function private.tc_is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.tc_profiles where id = (select auth.uid()) and role_id = 'admin');
$$;
revoke all on function public.tc_create_profile() from public;
revoke all on function private.tc_is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.tc_is_admin() to authenticated;

create policy "authenticated users read roles" on public.tc_roles for select to authenticated using (true);
create policy "users read their own profile" on public.tc_profiles for select to authenticated using (id = (select auth.uid()) or (select private.tc_is_admin()));
create policy "users update their own profile" on public.tc_profiles for update to authenticated using (id = (select auth.uid()) or (select private.tc_is_admin())) with check (id = (select auth.uid()) or (select private.tc_is_admin()));
create policy "admins read permissions" on public.tc_permissions for select to authenticated using ((select private.tc_is_admin()));
create policy "admins manage permissions" on public.tc_permissions for all to authenticated using ((select private.tc_is_admin())) with check ((select private.tc_is_admin()));
grant select on public.tc_roles to authenticated;
grant select, update on public.tc_profiles to authenticated;
grant select, insert, update, delete on public.tc_permissions to authenticated;
