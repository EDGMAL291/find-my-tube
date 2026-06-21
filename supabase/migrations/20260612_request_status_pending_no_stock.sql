alter table if exists public.stock_requests
  alter column status drop default;

update public.stock_requests
set status = 'pending'
where status in ('received', 'submitted');

update public.stock_requests
set status = 'no-stock'
where status in ('no_stock', 'no stock', 'out-of-stock', 'out of stock');

alter table if exists public.stock_requests
  drop constraint if exists stock_requests_status_check;

alter table if exists public.stock_requests
  add constraint stock_requests_status_check
  check (status in ('pending', 'packed', 'ready', 'collected', 'completed', 'cancelled', 'no-stock'));

alter table if exists public.stock_requests
  alter column status set default 'pending';
