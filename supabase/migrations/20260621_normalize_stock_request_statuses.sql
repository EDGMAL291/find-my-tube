-- Normalize Find My Tube stock request statuses to the current canonical workflow.
-- Canonical DB values are lowercase slugs; app and Sheet payloads expose labels:
-- Pending, Packed, Ready, Collected, Completed, Cancelled, No Stock.

alter table if exists public.stock_requests
  alter column status drop default;

update public.stock_requests
set status = case
  when lower(coalesce(status, '')) in ('received', 'submitted') then 'pending'
  when lower(coalesce(status, '')) in ('processing', 'in-progress') then 'packed'
  when lower(coalesce(status, '')) in ('sent') then 'completed'
  when lower(coalesce(status, '')) in ('no_stock', 'no stock', 'out-of-stock', 'out of stock') then 'no-stock'
  when lower(coalesce(status, '')) in ('pending', 'packed', 'ready', 'collected', 'completed', 'cancelled', 'no-stock') then lower(status)
  else 'pending'
end
where status is null
  or lower(coalesce(status, '')) not in ('pending', 'packed', 'ready', 'collected', 'completed', 'cancelled', 'no-stock')
  or status <> lower(status);

update public.stock_requests
set status_history = coalesce((
  select jsonb_agg(
    case
      when entry ? 'status' then jsonb_set(
        entry,
        '{status}',
        to_jsonb(case
          when lower(coalesce(entry->>'status', '')) in ('received', 'submitted') then 'pending'
          when lower(coalesce(entry->>'status', '')) in ('processing', 'in-progress') then 'packed'
          when lower(coalesce(entry->>'status', '')) in ('sent') then 'completed'
          when lower(coalesce(entry->>'status', '')) in ('no_stock', 'no stock', 'out-of-stock', 'out of stock') then 'no-stock'
          when lower(coalesce(entry->>'status', '')) in ('pending', 'packed', 'ready', 'collected', 'completed', 'cancelled', 'no-stock') then lower(entry->>'status')
          else 'pending'
        end),
        true
      )
      else entry
    end
  )
  from jsonb_array_elements(status_history) as entry
), '[]'::jsonb)
where jsonb_typeof(status_history) = 'array';

alter table if exists public.stock_requests
  drop constraint if exists stock_requests_status_check;

alter table if exists public.stock_requests
  add constraint stock_requests_status_check
  check (status in ('pending', 'packed', 'ready', 'collected', 'completed', 'cancelled', 'no-stock'));

alter table if exists public.stock_requests
  alter column status set default 'pending';
