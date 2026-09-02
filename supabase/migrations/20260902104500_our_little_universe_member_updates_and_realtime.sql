create policy "members update their own universe profile"
on public.universe_members for update to authenticated
using (user_id = (select auth.uid()) and public.is_universe_member(space_id))
with check (user_id = (select auth.uid()) and public.is_universe_member(space_id));

create policy "universe members use private realtime"
on realtime.messages for select to authenticated
using (
  realtime.messages.extension in ('broadcast', 'presence')
  and split_part((select realtime.topic()), ':', 2)::uuid in (
    select m.space_id from public.universe_members m where m.user_id = (select auth.uid())
  )
);
create policy "universe members send private realtime"
on realtime.messages for insert to authenticated
with check (
  realtime.messages.extension in ('broadcast', 'presence')
  and split_part((select realtime.topic()), ':', 2)::uuid in (
    select m.space_id from public.universe_members m where m.user_id = (select auth.uid())
  )
);
