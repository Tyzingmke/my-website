-- Our Little Universe: private two-person space. All application data is membership-scoped.
create type public.universe_role as enum ('owner', 'partner');
create type public.universe_shell as enum ('romantic', 'console');

create table public.universe_spaces (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Our Little Universe' check (char_length(title) between 1 and 120),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.universe_members (
  space_id uuid not null references public.universe_spaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.universe_role not null,
  shell public.universe_shell not null default 'romantic',
  display_name text not null default 'Stargazer' check (char_length(display_name) between 1 and 80),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  joined_at timestamptz not null default now(),
  primary key (space_id, user_id),
  unique (space_id, role)
);

create table public.universe_settings (
  space_id uuid primary key references public.universe_spaces(id) on delete cascade,
  config jsonb not null default '{"quote":"The smallest moments become whole worlds when we keep them together.","allow_location":false,"call_provider":"not_configured"}'::jsonb,
  version integer not null default 1,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.universe_config_revisions (
  id bigint generated always as identity primary key,
  space_id uuid not null references public.universe_spaces(id) on delete cascade,
  version integer not null,
  config jsonb not null,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (space_id, version)
);

create table public.universe_messages (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.universe_spaces(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null,
  body text not null default '' check (char_length(body) <= 5000),
  kind text not null default 'text' check (kind in ('text', 'image', 'video', 'audio', 'system')),
  attachment_path text,
  reply_to uuid references public.universe_messages(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sender_id, client_id),
  check (char_length(trim(body)) > 0 or attachment_path is not null)
);

create table public.universe_message_reactions (
  message_id uuid not null references public.universe_messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 8),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);

create table public.universe_memories (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.universe_spaces(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  note text not null default '',
  happened_on date,
  cover_path text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.universe_audit_events (
  id bigint generated always as identity primary key,
  space_id uuid not null references public.universe_spaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index universe_messages_space_created_idx on public.universe_messages (space_id, created_at desc);
create index universe_memories_space_created_idx on public.universe_memories (space_id, created_at desc);

create or replace function public.is_universe_member(target_space uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.universe_members m where m.space_id = target_space and m.user_id = (select auth.uid()));
$$;
create or replace function public.is_universe_owner(target_space uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.universe_members m where m.space_id = target_space and m.user_id = (select auth.uid()) and m.role = 'owner');
$$;
revoke all on function public.is_universe_member(uuid) from public;
revoke all on function public.is_universe_owner(uuid) from public;
grant execute on function public.is_universe_member(uuid), public.is_universe_owner(uuid) to authenticated;

create or replace function public.universe_stamp_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
create trigger universe_spaces_updated before update on public.universe_spaces for each row execute function public.universe_stamp_updated_at();
create trigger universe_settings_updated before update on public.universe_settings for each row execute function public.universe_stamp_updated_at();
create trigger universe_messages_updated before update on public.universe_messages for each row execute function public.universe_stamp_updated_at();
create trigger universe_memories_updated before update on public.universe_memories for each row execute function public.universe_stamp_updated_at();

create or replace function public.universe_capture_settings_revision() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' or old.config is distinct from new.config then
    insert into public.universe_config_revisions(space_id, version, config, changed_by) values (new.space_id, new.version, new.config, (select auth.uid()));
  end if;
  return new;
end; $$;
create trigger universe_settings_revision after insert or update on public.universe_settings for each row execute function public.universe_capture_settings_revision();

create or replace function public.bootstrap_universe(space_title text, member_name text, member_shell public.universe_shell default 'console')
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_space uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if exists (select 1 from public.universe_members where user_id = (select auth.uid())) then
    raise exception 'This account already belongs to a private space';
  end if;
  insert into public.universe_spaces(title, created_by) values (coalesce(nullif(trim(space_title), ''), 'Our Little Universe'), (select auth.uid())) returning id into new_space;
  insert into public.universe_members(space_id, user_id, role, shell, display_name) values (new_space, (select auth.uid()), 'owner', member_shell, coalesce(nullif(trim(member_name), ''), 'Stargazer'));
  insert into public.universe_settings(space_id, updated_by) values (new_space, (select auth.uid()));
  insert into public.universe_audit_events(space_id, actor_id, action) values (new_space, (select auth.uid()), 'space.created');
  return new_space;
end; $$;
revoke all on function public.bootstrap_universe(text, text, public.universe_shell) from public;
grant execute on function public.bootstrap_universe(text, text, public.universe_shell) to authenticated;

alter table public.universe_spaces enable row level security;
alter table public.universe_members enable row level security;
alter table public.universe_settings enable row level security;
alter table public.universe_config_revisions enable row level security;
alter table public.universe_messages enable row level security;
alter table public.universe_message_reactions enable row level security;
alter table public.universe_memories enable row level security;
alter table public.universe_audit_events enable row level security;

create policy "universe members read spaces" on public.universe_spaces for select to authenticated using (public.is_universe_member(id));
create policy "universe members read members" on public.universe_members for select to authenticated using (public.is_universe_member(space_id));
create policy "universe members read settings" on public.universe_settings for select to authenticated using (public.is_universe_member(space_id));
create policy "universe owners update settings" on public.universe_settings for update to authenticated using (public.is_universe_owner(space_id)) with check (public.is_universe_owner(space_id));
create policy "universe members read config revisions" on public.universe_config_revisions for select to authenticated using (public.is_universe_member(space_id));
create policy "universe members read messages" on public.universe_messages for select to authenticated using (public.is_universe_member(space_id));
create policy "universe members send messages" on public.universe_messages for insert to authenticated with check (public.is_universe_member(space_id) and sender_id = (select auth.uid()));
create policy "message sender updates own messages" on public.universe_messages for update to authenticated using (sender_id = (select auth.uid()) and public.is_universe_member(space_id)) with check (sender_id = (select auth.uid()) and public.is_universe_member(space_id));
create policy "universe members read reactions" on public.universe_message_reactions for select to authenticated using (exists (select 1 from public.universe_messages msg where msg.id = message_id and public.is_universe_member(msg.space_id)));
create policy "universe members react" on public.universe_message_reactions for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.universe_messages msg where msg.id = message_id and public.is_universe_member(msg.space_id)));
create policy "members remove own reactions" on public.universe_message_reactions for delete to authenticated using (user_id = (select auth.uid()));
create policy "universe members read memories" on public.universe_memories for select to authenticated using (public.is_universe_member(space_id));
create policy "universe members create memories" on public.universe_memories for insert to authenticated with check (public.is_universe_member(space_id) and created_by = (select auth.uid()));
create policy "memory creators update own" on public.universe_memories for update to authenticated using (created_by = (select auth.uid()) and public.is_universe_member(space_id)) with check (created_by = (select auth.uid()) and public.is_universe_member(space_id));
create policy "owners can delete memories" on public.universe_memories for delete to authenticated using (public.is_universe_owner(space_id));
create policy "universe owners read audit" on public.universe_audit_events for select to authenticated using (public.is_universe_owner(space_id));


grant select on public.universe_spaces, public.universe_members, public.universe_settings, public.universe_config_revisions, public.universe_messages, public.universe_message_reactions, public.universe_memories, public.universe_audit_events to authenticated;
grant insert, update on public.universe_messages to authenticated;
grant insert, delete on public.universe_message_reactions to authenticated;
grant insert, update on public.universe_memories to authenticated;
grant update on public.universe_settings to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('universe-media', 'universe-media', false, 52428800, array['image/jpeg','image/png','image/webp','image/avif','video/mp4','audio/mpeg','audio/mp4','audio/webm','audio/wav'])
on conflict (id) do nothing;

create policy "universe members read private media" on storage.objects for select to authenticated using (bucket_id = 'universe-media' and public.is_universe_member(((storage.foldername(name))[1])::uuid));
create policy "universe members upload private media" on storage.objects for insert to authenticated with check (bucket_id = 'universe-media' and public.is_universe_member(((storage.foldername(name))[1])::uuid));
create policy "universe owners delete private media" on storage.objects for delete to authenticated using (bucket_id = 'universe-media' and public.is_universe_owner(((storage.foldername(name))[1])::uuid));
