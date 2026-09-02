drop table if exists public.niche_chat_messages cascade;
drop table if exists public.niche_chat_sessions cascade;

update public.cms_documents
set draft_body = draft_body - 'nicheQuestion' - 'nicheQuotes' - 'nichePlayQuestion' - 'nichePlayYesResponse' - 'nichePlayNoResponse',
    published_body = published_body - 'nicheQuestion' - 'nicheQuotes' - 'nichePlayQuestion' - 'nichePlayYesResponse' - 'nichePlayNoResponse'
where kind = 'site_settings';

update public.workspaces
set settings = settings - 'niche_password_hash'
where settings ? 'niche_password_hash';
