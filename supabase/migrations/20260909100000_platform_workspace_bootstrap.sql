create or replace function public.platform_bootstrap_workspace(workspace_name text, workspace_slug text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user uuid := auth.uid();
  new_workspace uuid;
begin
  if current_user is null then
    raise exception 'Authentication is required.';
  end if;

  select workspace_id into new_workspace
  from public.platform_memberships
  where user_id = current_user and status = 'active'
  order by created_at asc
  limit 1;

  if new_workspace is not null then
    return new_workspace;
  end if;

  insert into public.platform_workspaces (name, slug)
  values (left(trim(workspace_name), 120), lower(regexp_replace(trim(workspace_slug), '[^a-zA-Z0-9-]+', '-', 'g')))
  returning id into new_workspace;

  insert into public.platform_profiles (id, display_name)
  values (current_user, nullif(split_part(coalesce(auth.jwt()->>'email', ''), '@', 1), ''))
  on conflict (id) do nothing;

  insert into public.platform_memberships (workspace_id, user_id, role, capabilities)
  values (new_workspace, current_user, 'owner', array['people.manage','content.write','products.write','tickets.read','tickets.write','orders.read','audit.read']);

  return new_workspace;
end;
$$;

revoke all on function public.platform_bootstrap_workspace(text, text) from public;
grant execute on function public.platform_bootstrap_workspace(text, text) to authenticated;
