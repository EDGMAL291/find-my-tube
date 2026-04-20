create table if not exists public.inventory_batches (
  id uuid primary key default gen_random_uuid(),
  item_key text not null,
  item_id text,
  item_name text not null,
  batch_number text not null,
  expiry_date date,
  quantity_received integer not null default 0,
  quantity_remaining integer not null default 0,
  date_received timestamptz not null default now(),
  received_by_user_id uuid references public.users(id) on delete set null,
  last_received_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_batches_item_batch_unique unique (item_key, batch_number)
);

create index if not exists idx_inventory_batches_item_key on public.inventory_batches(item_key);
create index if not exists idx_inventory_batches_batch_number on public.inventory_batches(batch_number);
create index if not exists idx_inventory_batches_expiry_date on public.inventory_batches(expiry_date);
