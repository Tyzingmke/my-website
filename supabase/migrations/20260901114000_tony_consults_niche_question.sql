update public.cms_documents
set draft_body = jsonb_set(draft_body, '{nicheQuestion}', '"What is my reference to you?"'::jsonb, true),
    published_body = jsonb_set(published_body, '{nicheQuestion}', '"What is my reference to you?"'::jsonb, true)
where workspace_id = '7ec3d48f-4435-4fd8-9651-2e0739c8cdd3'
  and kind = 'site_settings'
  and slug = 'site-theme';
