-- Find My Tube stock dashboard schema migration
-- Run in Supabase SQL editor or via CLI migration tooling.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  user_number text not null unique,
  display_name text not null,
  pin_hash text not null,
  role text not null check (role in ('admin', 'labUser')),
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_requests (
  id text primary key,
  source text not null default 'find-my-tube',
  requested_by_user_id uuid references public.users(id) on delete set null,
  entered_by_user_id uuid references public.users(id) on delete set null,
  requester_name text not null,
  ward_or_unit text not null,
  notes text,
  request_text text,
  status text not null default 'received' check (status in ('received', 'packed', 'ready', 'collected', 'completed', 'cancelled')),
  status_updated_by_user_id uuid references public.users(id) on delete set null,
  status_history jsonb not null default '[]'::jsonb,
  inventory_deducted boolean not null default false,
  inventory_deducted_at timestamptz,
  inventory_deducted_by_user_id uuid references public.users(id) on delete set null,
  collection_record jsonb,
  line_item_count integer not null default 0,
  total_requested_quantity integer not null default 0,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_request_items (
  id uuid primary key default gen_random_uuid(),
  stock_request_id text not null references public.stock_requests(id) on delete cascade,
  item_id text,
  item_name text not null,
  variant_label text,
  quantity integer not null check (quantity > 0),
  unit text not null,
  tray_size integer,
  packet_size integer,
  inventory_units integer not null default 0,
  formatted_quantity text,
  sheet_column_key text,
  sheet_tray_column_key text,
  sheet_single_column_key text,
  created_at timestamptz not null default now()
);

create table if not exists public.received_stock (
  id text primary key,
  recorded_by_user_id uuid references public.users(id) on delete set null,
  supplier text,
  reference text,
  notes text,
  line_item_count integer not null default 0,
  total_received_quantity integer not null default 0,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.received_stock_items (
  id uuid primary key default gen_random_uuid(),
  received_stock_id text not null references public.received_stock(id) on delete cascade,
  item_id text,
  item_name text not null,
  variant_label text,
  quantity integer not null check (quantity > 0),
  unit text not null,
  tray_size integer,
  packet_size integer,
  inventory_units integer not null default 0,
  formatted_quantity text,
  sheet_column_key text,
  sheet_tray_column_key text,
  sheet_single_column_key text,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_balances (
  id uuid primary key default gen_random_uuid(),
  item_key text not null unique,
  item_name text not null,
  quantity_on_hand integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.lab_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  user_id uuid not null references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_user_number on public.users(user_number);
create index if not exists idx_stock_requests_created_at on public.stock_requests(created_at desc);
create index if not exists idx_stock_requests_status on public.stock_requests(status);
create index if not exists idx_stock_request_items_request_id on public.stock_request_items(stock_request_id);
create index if not exists idx_received_stock_created_at on public.received_stock(created_at desc);
create index if not exists idx_received_stock_items_received_id on public.received_stock_items(received_stock_id);
create index if not exists idx_inventory_balances_item_key on public.inventory_balances(item_key);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
create index if not exists idx_lab_sessions_expires_at on public.lab_sessions(expires_at);
create index if not exists idx_lab_sessions_user_id on public.lab_sessions(user_id);
