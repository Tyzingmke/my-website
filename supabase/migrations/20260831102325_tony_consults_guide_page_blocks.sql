with guide_blocks(slug, blocks) as (
  values
    ('website-design-kenya', '[
      {"id":"hero","type":"hero","label":"Hero","eyebrow":"Website design in Kenya","heading":"Clear, responsive sites for serious work.","body":"Tony Consults builds focused website systems for Kenyan professionals, businesses and organisations.","ctaLabel":"Request a quote","ctaHref":"/contact/"},
      {"id":"services","type":"features","label":"What is included","eyebrow":"Built for the work","heading":"A website with a clear job.","items":["Responsive page design","SEO-ready foundations","Direct enquiry paths","Simple maintenance"]},
      {"id":"cta","type":"cta","label":"Project call to action","eyebrow":"Ready to begin","heading":"Make the next step clear.","body":"Tell me what your business needs the website to achieve.","ctaLabel":"Start a project","ctaHref":"/contact/"}
    ]'::jsonb),
    ('website-cost-kenya', '[
      {"id":"hero","type":"hero","label":"Hero","eyebrow":"Website cost guide","heading":"Know what you are paying for.","body":"A practical guide to website scope, costs and launch priorities in Kenya.","ctaLabel":"Discuss your budget","ctaHref":"/contact/"},
      {"id":"factors","type":"features","label":"Cost factors","eyebrow":"What affects scope","heading":"Build the right first version.","items":["Page count and content","E-commerce features","Payment integrations","Custom motion and media","Launch timelines"]},
      {"id":"cta","type":"cta","label":"Project call to action","eyebrow":"Get a focused quote","heading":"Start with what matters now.","body":"A focused first version can grow when the business needs more.","ctaLabel":"Request a quote","ctaHref":"/contact/"}
    ]'::jsonb)
)
update public.cms_documents as document
set draft_body = jsonb_set(coalesce(document.draft_body, '{}'::jsonb), '{blocks}', guide_blocks.blocks, true),
    published_body = case when document.published_body is null then null else jsonb_set(document.published_body, '{blocks}', guide_blocks.blocks, true) end
from guide_blocks
where document.workspace_id = '7ec3d48f-4435-4fd8-9651-2e0739c8cdd3'
  and document.kind = 'page'
  and document.slug = guide_blocks.slug;
