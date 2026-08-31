-- Structured blocks mirror the public portfolio's editorial composition.
-- The Studio edits only content stored here; application code and deployment
-- configuration remain in the protected Git repository.
with page_blocks(slug, blocks) as (
  values
    ('home', '[
      {"id":"hero","type":"hero","label":"Hero","eyebrow":"Tony Consults / website design & digital systems","heading":"Websites built for real work.","body":"I design fast, credible digital homes for businesses, professionals and organisations.","ctaLabel":"Book a call","ctaHref":"/contact/"},
      {"id":"about","type":"story","label":"About introduction","eyebrow":"01 / About","heading":"A practical mind, built through doing.","body":"I started with engineering and followed my curiosity into IT, websites and digital systems. The common thread is simple: understand how something works, then make it work better.","ctaLabel":"Read my story","ctaHref":"/about/"},
      {"id":"work","type":"collection","label":"Selected work","eyebrow":"02 / Selected work","heading":"Useful systems, clearly presented.","body":"Concepts and practical builds shaped around a clear audience, a focused action and straightforward maintenance.","items":["Portfolio concepts","Business websites","E-commerce systems"],"ctaLabel":"View all projects","ctaHref":"/work/"},
      {"id":"services","type":"features","label":"Services","eyebrow":"03 / Services","heading":"Choose the right starting point.","body":"Clear scopes for a portfolio launch, a business growth pack or a full e-commerce build with tiered upgrades.","items":["Portfolio websites","Business website packs","E-commerce websites"],"ctaLabel":"See services","ctaHref":"/services/"},
      {"id":"standard","type":"cta","label":"Working standard","eyebrow":"The working standard","heading":"Fast enough to feel effortless.","body":"Clear enough to be useful.","ctaLabel":"Start a project","ctaHref":"/contact/"}
    ]'::jsonb),
    ('about', '[
      {"id":"hero","type":"hero","label":"Hero","eyebrow":"About Antony / Tony Consults","heading":"Practical thinking. Digital direction.","body":"I combine engineering discipline, self-directed technology learning and hands-on web development to build useful digital systems.","ctaLabel":"Start a project","ctaHref":"/contact/"},
      {"id":"approach","type":"story","label":"My approach","eyebrow":"My approach","heading":"Understand the system. Then improve it.","body":"Automotive engineering taught me to diagnose carefully. Web development taught me to communicate clearly. Cybersecurity is teaching me to think ahead about risk."},
      {"id":"journey","type":"collection","label":"Journey timeline","eyebrow":"The journey","heading":"Eight useful turning points.","body":"Every stage added a practical layer: systems thinking, independent learning, client delivery and a stronger understanding of digital safety.","items":["Automotive engineering","Discovering IT","Self-learning web development","Freelancing and referrals","Cybersecurity and AI"],"ctaLabel":"Discuss a similar need","ctaHref":"/contact/"},
      {"id":"capabilities","type":"features","label":"Capabilities","eyebrow":"Current capabilities","heading":"Skills that connect to real outcomes.","items":["Web design","Digital systems","SEO foundations","Cybersecurity awareness"]}
    ]'::jsonb),
    ('work', '[
      {"id":"hero","type":"hero","label":"Hero","eyebrow":"Selected work","heading":"Built to look sharp. Made to work.","body":"A focused selection of portfolio concepts, business websites and practical digital systems.","ctaLabel":"Start a project","ctaHref":"/contact/"},
      {"id":"projects","type":"collection","label":"Project index","eyebrow":"Project index","heading":"Ideas made usable.","body":"Each project is shaped around the business, audience and most useful action.","items":["Portfolio websites","Business systems","E-commerce foundations"],"ctaLabel":"Discuss your project","ctaHref":"/contact/"}
    ]'::jsonb),
    ('services', '[
      {"id":"hero","type":"hero","label":"Hero","eyebrow":"Services","heading":"Tiered plans, clear upgrades.","body":"Website packages for professionals, growing businesses and commerce teams.","ctaLabel":"Choose a starting point","ctaHref":"/contact/"},
      {"id":"plans","type":"collection","label":"Service families","eyebrow":"Choose a route","heading":"Three ways to build.","body":"Start with the scope that matches your work today, then expand when your business needs more.","items":["Portfolio websites","Business website packs","E-commerce websites"],"ctaLabel":"Request a quote","ctaHref":"/contact/"},
      {"id":"included","type":"features","label":"Included foundations","eyebrow":"Built for launch","heading":"The things every site needs.","items":["Mobile-ready layouts","SEO foundations","Direct contact routes","Clear next steps"]}
    ]'::jsonb),
    ('contact', '[
      {"id":"hero","type":"hero","label":"Hero","eyebrow":"Contact","heading":"Tell me what needs to work.","body":"Share the business goal, the people you need to reach and the action your website should make easier.","ctaLabel":"Email Antony","ctaHref":"mailto:antonymburu379@gmail.com"},
      {"id":"brief","type":"details","label":"A useful brief","eyebrow":"Before we talk","heading":"A clear starting point.","body":"A helpful project brief covers your business, audience, pages, main customer action, launch date and budget."}
    ]'::jsonb)
)
update public.cms_documents as document
set draft_body = jsonb_set(coalesce(document.draft_body, '{}'::jsonb), '{blocks}', page_blocks.blocks, true),
    published_body = case when document.published_body is null then null else jsonb_set(document.published_body, '{blocks}', page_blocks.blocks, true) end
from page_blocks
where document.workspace_id = '7ec3d48f-4435-4fd8-9651-2e0739c8cdd3'
  and document.kind = 'page'
  and document.slug = page_blocks.slug;

-- Give projects and services the same editable block shape while preserving
-- their existing titles and summary fields.
update public.cms_documents
set draft_body = jsonb_set(
      coalesce(draft_body, '{}'::jsonb),
      '{blocks}',
      jsonb_build_array(
        jsonb_build_object('id', 'hero', 'type', 'hero', 'label', 'Hero', 'eyebrow', kind::text, 'heading', title, 'body', coalesce(draft_body ->> 'summary', '')),
        jsonb_build_object('id', 'details', 'type', 'details', 'label', 'Details', 'heading', 'Project details', 'body', coalesce(draft_body ->> 'body', 'Add the details that make this work useful.'))
      ),
      true
    ),
    published_body = case when published_body is null then null else jsonb_set(
      published_body,
      '{blocks}',
      jsonb_build_array(
        jsonb_build_object('id', 'hero', 'type', 'hero', 'label', 'Hero', 'eyebrow', kind::text, 'heading', title, 'body', coalesce(draft_body ->> 'summary', '')),
        jsonb_build_object('id', 'details', 'type', 'details', 'label', 'Details', 'heading', 'Project details', 'body', coalesce(draft_body ->> 'body', 'Add the details that make this work useful.'))
      ),
      true
    ) end
where workspace_id = '7ec3d48f-4435-4fd8-9651-2e0739c8cdd3'
  and kind in ('project', 'service')
  and not (draft_body ? 'blocks');
