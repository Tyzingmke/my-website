create table public.universe_games (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.universe_spaces(id) on delete cascade,
  game_type text not null check (game_type in ('tic_tac_toe', 'ludo_score')),
  state jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'finished')),
  created_by uuid not null references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now(),
  unique (space_id, game_type)
);

create table public.universe_game_scores (
  game_id uuid not null references public.universe_games(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (game_id, user_id)
);

create trigger universe_games_updated before update on public.universe_games for each row execute function public.universe_stamp_updated_at();
create trigger universe_game_scores_updated before update on public.universe_game_scores for each row execute function public.universe_stamp_updated_at();
alter table public.universe_games enable row level security;
alter table public.universe_game_scores enable row level security;
create policy "members read shared games" on public.universe_games for select to authenticated using (public.is_universe_member(space_id));
create policy "members create shared games" on public.universe_games for insert to authenticated with check (public.is_universe_member(space_id) and created_by = (select auth.uid()));
create policy "members update shared games" on public.universe_games for update to authenticated using (public.is_universe_member(space_id)) with check (public.is_universe_member(space_id));
create policy "members read shared scores" on public.universe_game_scores for select to authenticated using (exists (select 1 from public.universe_games game where game.id = game_id and public.is_universe_member(game.space_id)));
create policy "members create shared scores" on public.universe_game_scores for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.universe_games game where game.id = game_id and public.is_universe_member(game.space_id)));
create policy "members update their score" on public.universe_game_scores for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, insert, update on public.universe_games, public.universe_game_scores to authenticated;
