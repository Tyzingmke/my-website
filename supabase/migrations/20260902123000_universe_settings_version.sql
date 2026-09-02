create or replace function public.universe_bump_settings_version()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.config is distinct from old.config then
    new.version := old.version + 1;
  end if;
  return new;
end;
$$;

drop trigger if exists universe_settings_bump_version on public.universe_settings;
create trigger universe_settings_bump_version
before update on public.universe_settings
for each row execute function public.universe_bump_settings_version();
