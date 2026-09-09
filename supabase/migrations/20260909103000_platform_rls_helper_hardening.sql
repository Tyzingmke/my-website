-- Align the deployed foundation with the private, least-privilege helper functions.
create schema if not exists private;

create or replace function private.platform_is_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.platform_memberships where workspace_id = target_workspace and user_id = (select auth.uid()) and status = 'active');
$$;
create or replace function private.platform_can(target_workspace uuid, required_capability text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.platform_memberships where workspace_id = target_workspace and user_id = (select auth.uid()) and status = 'active' and (role in ('owner', 'admin') or required_capability = any(capabilities)));
$$;
revoke all on function private.platform_is_member(uuid) from public;
revoke all on function private.platform_can(uuid, text) from public;
grant usage on schema private to authenticated;
grant execute on function private.platform_is_member(uuid), private.platform_can(uuid, text) to authenticated;

drop policy if exists "members read their workspace" on public.platform_workspaces;
drop policy if exists "members read membership" on public.platform_memberships;
drop policy if exists "owners manage memberships" on public.platform_memberships;
drop policy if exists "members read workspace content" on public.platform_content;
drop policy if exists "authors manage content" on public.platform_content;
drop policy if exists "members read products" on public.platform_products;
drop policy if exists "sellers manage products" on public.platform_products;
drop policy if exists "clients see their tickets" on public.platform_tickets;
drop policy if exists "clients create tickets" on public.platform_tickets;
drop policy if exists "staff manage tickets" on public.platform_tickets;
drop policy if exists "ticket participants read messages" on public.platform_ticket_messages;
drop policy if exists "ticket participants send messages" on public.platform_ticket_messages;
drop policy if exists "buyers see own orders" on public.platform_orders;
drop policy if exists "staff read audit events" on public.platform_audit_events;

create policy "members read their workspace" on public.platform_workspaces for select to authenticated using ((select private.platform_is_member(id)));
create policy "members read membership" on public.platform_memberships for select to authenticated using ((select private.platform_is_member(workspace_id)));
create policy "owners manage memberships" on public.platform_memberships for all to authenticated using ((select private.platform_can(workspace_id, 'people.manage'))) with check ((select private.platform_can(workspace_id, 'people.manage')));
create policy "members read workspace content" on public.platform_content for select to authenticated using ((select private.platform_is_member(workspace_id)));
create policy "authors manage content" on public.platform_content for all to authenticated using ((select private.platform_can(workspace_id, 'content.write'))) with check ((select private.platform_can(workspace_id, 'content.write')));
create policy "members read products" on public.platform_products for select to authenticated using ((select private.platform_is_member(workspace_id)));
create policy "sellers manage products" on public.platform_products for all to authenticated using ((select private.platform_can(workspace_id, 'products.write'))) with check ((select private.platform_can(workspace_id, 'products.write')));
create policy "clients see their tickets" on public.platform_tickets for select to authenticated using (client_id = (select auth.uid()) or (select private.platform_can(workspace_id, 'tickets.read')));
create policy "clients create tickets" on public.platform_tickets for insert to authenticated with check (client_id = (select auth.uid()) and (select private.platform_is_member(workspace_id)));
create policy "staff manage tickets" on public.platform_tickets for update to authenticated using ((select private.platform_can(workspace_id, 'tickets.write'))) with check ((select private.platform_can(workspace_id, 'tickets.write')));
create policy "ticket participants read messages" on public.platform_ticket_messages for select to authenticated using (exists(select 1 from public.platform_tickets t where t.id = ticket_id and (t.client_id = (select auth.uid()) or (select private.platform_can(t.workspace_id, 'tickets.read')))));
create policy "ticket participants send messages" on public.platform_ticket_messages for insert to authenticated with check (sender_id = (select auth.uid()) and exists(select 1 from public.platform_tickets t where t.id = ticket_id and (t.client_id = (select auth.uid()) or (select private.platform_can(t.workspace_id, 'tickets.write')))));
create policy "buyers see own orders" on public.platform_orders for select to authenticated using (buyer_id = (select auth.uid()) or (select private.platform_can(workspace_id, 'orders.read')));
create policy "staff read audit events" on public.platform_audit_events for select to authenticated using ((select private.platform_can(workspace_id, 'audit.read')));
drop function if exists public.platform_is_member(uuid);
drop function if exists public.platform_can(uuid, text);
