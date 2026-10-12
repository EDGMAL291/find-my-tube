-- Optional private contact number. Browser database access remains controlled
-- by the existing RLS/grants migration. Public API responses omit this column.
alter table public.stock_requests
  add column if not exists contact_extension text;

alter table public.stock_requests
  drop constraint if exists stock_requests_contact_extension_valid;
alter table public.stock_requests
  add constraint stock_requests_contact_extension_valid check (
    contact_extension is null or (
      length(contact_extension) between 1 and 24
      and contact_extension ~ '^[0-9+*#() -]+$'
    )
  );
