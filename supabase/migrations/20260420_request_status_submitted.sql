alter table if exists public.stock_requests
  alter column status drop default;

update public.stock_requests
set status = 'submitted'
where status = 'received';

alter table if exists public.stock_requests
  drop constraint if exists stock_requests_status_check;

alter table if exists public.stock_requests
  add constraint stock_requests_status_check
  check (status in ('submitted', 'packed', 'ready', 'collected', 'completed', 'cancelled'));

alter table if exists public.stock_requests
  alter column status set default 'submitted';
