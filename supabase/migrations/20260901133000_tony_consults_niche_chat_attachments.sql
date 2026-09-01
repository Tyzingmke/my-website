alter table public.niche_chat_messages
  add column if not exists room text not null default 'shared',
  add column if not exists attachment_path text,
  add column if not exists attachment_name text,
  add column if not exists attachment_type text;

alter table public.niche_chat_messages
  drop constraint if exists niche_chat_messages_message_check;

alter table public.niche_chat_messages
  add constraint niche_chat_messages_content_check
  check (
    char_length(message) <= 1000
    and (char_length(btrim(message)) > 0 or attachment_path is not null)
  );

alter table public.niche_chat_messages
  add constraint niche_chat_messages_room_check
  check (room in ('shared', 'personal'));

create index if not exists niche_chat_messages_room_created_idx
  on public.niche_chat_messages (room, created_at);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'niche-messenger',
  'niche-messenger',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
