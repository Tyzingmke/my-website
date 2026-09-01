create table public.niche_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.niche_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.niche_chat_sessions(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 40),
  message text not null check (char_length(message) between 1 and 1000),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index niche_chat_messages_created_idx on public.niche_chat_messages (created_at);
create index niche_chat_sessions_token_idx on public.niche_chat_sessions (token_hash);

alter table public.niche_chat_sessions enable row level security;
alter table public.niche_chat_messages enable row level security;
