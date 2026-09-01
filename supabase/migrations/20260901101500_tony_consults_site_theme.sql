insert into public.cms_documents (
  workspace_id,
  kind,
  slug,
  title,
  status,
  draft_body,
  published_body,
  published_at
)
values (
  '7ec3d48f-4435-4fd8-9651-2e0739c8cdd3',
  'site_settings',
  'site-theme',
  'Public website theme',
  'published',
  '{"theme":"dark"}'::jsonb,
  '{"theme":"dark"}'::jsonb,
  now()
)
on conflict (workspace_id, kind, slug) do nothing;
