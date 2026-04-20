-- Enforce single active dashboard session per user
-- Adds backend session source-of-truth fields.

alter table if exists public.users
  add column if not exists active_session_token_hash text;

alter table if exists public.users
  add column if not exists last_seen_at timestamptz;

create index if not exists idx_users_active_session_token_hash
  on public.users(active_session_token_hash);
