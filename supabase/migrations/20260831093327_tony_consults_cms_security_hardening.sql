-- Keep internal helpers out of the exposed public REST/RPC schema.
create schema if not exists private;
revoke all on schema private from public;

alter function public.is_workspace_member(uuid) set schema private;
alter function public.has_workspace_capability(uuid, text) set schema private;

revoke all on function private.is_workspace_member(uuid) from public, anon;
revoke all on function private.has_workspace_capability(uuid, text) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.has_workspace_capability(uuid, text) to authenticated;

-- Trigger functions do not need elevated privileges and cannot be called through
-- the API after execution is revoked from every client role.
alter function public.bump_document_version() security invoker;
alter function public.capture_document_revision() security invoker;
revoke all on function public.bump_document_version() from public, anon, authenticated;
revoke all on function public.capture_document_revision() from public, anon, authenticated;

create index if not exists workspace_memberships_user_workspace_idx on public.workspace_memberships (user_id, workspace_id);
create index if not exists workspace_memberships_invited_by_idx on public.workspace_memberships (invited_by);
create index if not exists cms_documents_created_by_idx on public.cms_documents (created_by);
create index if not exists cms_documents_updated_by_idx on public.cms_documents (updated_by);
create index if not exists cms_documents_published_by_idx on public.cms_documents (published_by);
create index if not exists cms_revisions_changed_by_idx on public.cms_revisions (changed_by);
create index if not exists cms_revisions_workspace_idx on public.cms_revisions (workspace_id);
create index if not exists form_submissions_assigned_to_idx on public.form_submissions (assigned_to);
create index if not exists media_assets_created_by_idx on public.media_assets (created_by);
create index if not exists publish_jobs_requested_by_idx on public.publish_jobs (requested_by);
create index if not exists audit_events_actor_id_idx on public.audit_events (actor_id);
