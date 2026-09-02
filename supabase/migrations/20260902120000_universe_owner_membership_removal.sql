create policy "owners remove partners from their universe"
on public.universe_members for delete to authenticated
using (role = 'partner' and public.is_universe_owner(space_id));

create policy "owners archive messages in their universe"
on public.universe_messages for update to authenticated
using (public.is_universe_owner(space_id))
with check (public.is_universe_owner(space_id));
