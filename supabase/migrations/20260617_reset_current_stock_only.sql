-- One-time Find My Tube fresh stock reset.
--
-- Reset only the current on-hand stock state so tomorrow's received stock can
-- rebuild balances from zero.
--
-- Affected:
-- - public.inventory_balances.quantity_on_hand is set to 0.
-- - public.received_stock_items is cleared to remove old receipt line items,
--   lot numbers, expiry dates, tray/packet counts, and received quantities.
-- - public.received_stock is cleared to remove old receipt headers.
-- - public.inventory_batches is cleared to remove old batch/lot balances.
--
-- Preserved:
-- - public.stock_requests and public.stock_request_items for Track Orders,
--   archived/completed orders, request status history, wards, and requester data.
-- - public.users, roles, sessions, audit logs, locations/settings, and the static
--   stock item catalogue used by Order Stock and Stock Dashboard selectors.

begin;

create table if not exists public.stock_reset_backup_20260617_inventory_balances
as table public.inventory_balances;

create table if not exists public.stock_reset_backup_20260617_received_stock
as table public.received_stock;

create table if not exists public.stock_reset_backup_20260617_received_stock_items
as table public.received_stock_items;

create table if not exists public.stock_reset_backup_20260617_inventory_batches
as table public.inventory_batches;

delete from public.received_stock_items;
delete from public.received_stock;

update public.inventory_balances
set
  quantity_on_hand = 0,
  updated_at = now();

delete from public.inventory_batches;

commit;
