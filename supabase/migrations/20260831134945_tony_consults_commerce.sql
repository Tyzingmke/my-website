create type public.store_product_status as enum ('draft', 'published', 'archived');
create type public.store_order_status as enum ('pending_payment', 'paid', 'fulfilled', 'cancelled');

create table public.store_products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text not null default '',
  product_type text not null default 'digital',
  price_kes integer not null check (price_kes >= 0),
  cover_image_url text,
  deliverable_path text,
  status public.store_product_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

create table public.store_orders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid not null references public.store_products(id) on delete restrict,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  payment_method text not null,
  payment_reference text,
  status public.store_order_status not null default 'pending_payment',
  fulfillment_note text,
  fulfilled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.commerce_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  mpesa_instructions text not null default 'Add your M-Pesa till or paybill instructions in Studio.',
  bank_instructions text not null default 'Add bank transfer instructions in Studio.',
  card_enabled boolean not null default false,
  google_pay_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create trigger store_products_set_updated_at before update on public.store_products for each row execute function public.set_updated_at();
create trigger store_orders_set_updated_at before update on public.store_orders for each row execute function public.set_updated_at();
create trigger commerce_settings_set_updated_at before update on public.commerce_settings for each row execute function public.set_updated_at();

alter table public.store_products enable row level security;
alter table public.store_orders enable row level security;
alter table public.commerce_settings enable row level security;
grant select on public.store_products, public.commerce_settings to anon;
grant insert on public.store_orders to anon;
grant select, insert, update, delete on public.store_products, public.store_orders, public.commerce_settings to authenticated;

create policy "public reads published products" on public.store_products for select to anon using (status = 'published');
create policy "members manage products" on public.store_products for all to authenticated using (public.has_workspace_capability(workspace_id, 'integration.manage')) with check (public.has_workspace_capability(workspace_id, 'integration.manage'));
create policy "public creates an order" on public.store_orders for insert to anon with check (status = 'pending_payment');
create policy "members manage orders" on public.store_orders for all to authenticated using (public.has_workspace_capability(workspace_id, 'integration.manage')) with check (public.has_workspace_capability(workspace_id, 'integration.manage'));
create policy "public reads commerce settings" on public.commerce_settings for select to anon using (true);
create policy "members manage commerce settings" on public.commerce_settings for all to authenticated using (public.has_workspace_capability(workspace_id, 'integration.manage')) with check (public.has_workspace_capability(workspace_id, 'integration.manage'));

insert into storage.buckets (id, name, public, file_size_limit)
values ('product-deliverables', 'product-deliverables', false, 524288000)
on conflict (id) do nothing;
create policy "owners access private deliverables" on storage.objects for all to authenticated using (bucket_id = 'product-deliverables' and public.has_workspace_capability(((storage.foldername(name))[1])::uuid, 'integration.manage')) with check (bucket_id = 'product-deliverables' and public.has_workspace_capability(((storage.foldername(name))[1])::uuid, 'integration.manage'));

insert into public.commerce_settings (workspace_id)
values ('7ec3d48f-4435-4fd8-9651-2e0739c8cdd3')
on conflict (workspace_id) do nothing;
