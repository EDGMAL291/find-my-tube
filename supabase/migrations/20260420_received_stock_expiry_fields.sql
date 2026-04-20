alter table if exists public.received_stock_items
  add column if not exists batch_number text;

alter table if exists public.received_stock_items
  add column if not exists expiry_date date;

create index if not exists idx_received_stock_items_expiry_date
  on public.received_stock_items(expiry_date);
