-- Harden direct database access and make order fulfilment atomic.
-- Apply before relying on atomic inventory deduction in production.

alter table if exists public.stock_requests
  add column if not exists cancelled_at timestamptz;

create index if not exists idx_stock_requests_ward_created_at
  on public.stock_requests (lower(ward_or_unit), created_at desc);

create or replace function public.transition_stock_request_status(
  p_request_id text,
  p_next_status text,
  p_actor_user_id uuid,
  p_actor_number text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.stock_requests%rowtype;
  v_previous_status text;
  v_now timestamptz := now();
  v_shortages jsonb := '[]'::jsonb;
  v_items jsonb := '[]'::jsonb;
  v_total_units integer := 0;
  v_should_deduct boolean := false;
begin
  if p_next_status not in ('pending', 'packed', 'ready', 'collected', 'completed', 'cancelled', 'no-stock') then
    return jsonb_build_object('ok', false, 'error', 'invalid-transition');
  end if;

  select * into v_request
  from public.stock_requests
  where id = p_request_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not-found');
  end if;

  v_previous_status := lower(coalesce(v_request.status, 'pending'));
  if v_previous_status <> p_next_status and not (
    (v_previous_status = 'pending' and p_next_status in ('packed', 'ready', 'cancelled', 'no-stock'))
    or (v_previous_status = 'packed' and p_next_status in ('pending', 'ready', 'cancelled', 'no-stock'))
    or (v_previous_status = 'ready' and p_next_status in ('packed', 'collected', 'completed', 'cancelled', 'no-stock'))
  ) then
    return jsonb_build_object(
      'ok', false,
      'error', 'invalid-transition',
      'previousStatus', v_previous_status
    );
  end if;

  v_should_deduct := p_next_status in ('collected', 'completed') and not coalesce(v_request.inventory_deducted, false);

  if v_should_deduct then
    with required as (
      select
        coalesce(nullif(item.sheet_column_key, ''), nullif(item.item_id, ''), item.item_name) as item_key,
        max(item.item_name) as item_name,
        sum(case
          when item.inventory_units > 0 then item.inventory_units
          when item.unit = 'tray' then item.quantity * coalesce(item.tray_size, 0)
          when item.unit = 'packet' then item.quantity * coalesce(item.packet_size, 0)
          else item.quantity
        end)::integer as required_units
      from public.stock_request_items item
      where item.stock_request_id = p_request_id
      group by coalesce(nullif(item.sheet_column_key, ''), nullif(item.item_id, ''), item.item_name)
    ), locked_balances as (
      select balance.item_key, balance.quantity_on_hand
      from public.inventory_balances balance
      join required on required.item_key = balance.item_key
      for update
    )
    select coalesce(jsonb_agg(jsonb_build_object(
      'key', required.item_key,
      'label', required.item_name,
      'requiredUnits', required.required_units,
      'onHand', greatest(coalesce(locked_balances.quantity_on_hand, 0), 0),
      'shortBy', required.required_units - greatest(coalesce(locked_balances.quantity_on_hand, 0), 0)
    )), '[]'::jsonb)
    into v_shortages
    from required
    left join locked_balances on locked_balances.item_key = required.item_key
    where required.required_units > greatest(coalesce(locked_balances.quantity_on_hand, 0), 0);

    if jsonb_array_length(v_shortages) > 0 then
      return jsonb_build_object(
        'ok', false,
        'error', 'insufficient-stock',
        'previousStatus', v_previous_status,
        'shortages', v_shortages
      );
    end if;

    with required as (
      select
        coalesce(nullif(item.sheet_column_key, ''), nullif(item.item_id, ''), item.item_name) as item_key,
        sum(case
          when item.inventory_units > 0 then item.inventory_units
          when item.unit = 'tray' then item.quantity * coalesce(item.tray_size, 0)
          when item.unit = 'packet' then item.quantity * coalesce(item.packet_size, 0)
          else item.quantity
        end)::integer as required_units
      from public.stock_request_items item
      where item.stock_request_id = p_request_id
      group by coalesce(nullif(item.sheet_column_key, ''), nullif(item.item_id, ''), item.item_name)
    )
    update public.inventory_balances balance
    set quantity_on_hand = balance.quantity_on_hand - required.required_units,
        updated_at = v_now
    from required
    where balance.item_key = required.item_key;

    select
      coalesce(jsonb_agg(jsonb_build_object(
        'id', item.item_id,
        'label', item.item_name,
        'variantLabel', item.variant_label,
        'quantity', item.quantity,
        'unitType', item.unit,
        'traySize', item.tray_size,
        'packetSize', item.packet_size,
        'formattedQuantity', item.formatted_quantity,
        'inventoryUnits', case
          when item.inventory_units > 0 then item.inventory_units
          when item.unit = 'tray' then item.quantity * coalesce(item.tray_size, 0)
          when item.unit = 'packet' then item.quantity * coalesce(item.packet_size, 0)
          else item.quantity
        end
      ) order by item.created_at), '[]'::jsonb),
      coalesce(sum(case
        when item.inventory_units > 0 then item.inventory_units
        when item.unit = 'tray' then item.quantity * coalesce(item.tray_size, 0)
        when item.unit = 'packet' then item.quantity * coalesce(item.packet_size, 0)
        else item.quantity
      end), 0)::integer
    into v_items, v_total_units
    from public.stock_request_items item
    where item.stock_request_id = p_request_id;
  end if;

  update public.stock_requests
  set status = p_next_status,
      updated_at = v_now,
      status_updated_by_user_id = p_actor_user_id,
      status_history = coalesce(status_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
        'status', p_next_status,
        'updatedAt', v_now,
        'updatedBy', coalesce(p_actor_number, '')
      )),
      cancelled_at = case when p_next_status = 'cancelled' then v_now else null end,
      inventory_deducted = case when v_should_deduct then true else inventory_deducted end,
      inventory_deducted_at = case when v_should_deduct then v_now else inventory_deducted_at end,
      inventory_deducted_by_user_id = case when v_should_deduct then p_actor_user_id else inventory_deducted_by_user_id end,
      collection_record = case when v_should_deduct then jsonb_build_object(
        'orderId', p_request_id,
        'collectedAt', v_now,
        'requestedBy', v_request.requester_name,
        'wardUnit', v_request.ward_or_unit,
        'markedCollectedBy', coalesce(p_actor_number, ''),
        'collectedBy', v_request.requester_name,
        'items', v_items,
        'totalUnitsDeducted', v_total_units
      ) else collection_record end
  where id = p_request_id;

  return jsonb_build_object(
    'ok', true,
    'requestId', p_request_id,
    'previousStatus', v_previous_status,
    'status', p_next_status,
    'inventoryDeducted', v_should_deduct
  );
end;
$$;

revoke all on function public.transition_stock_request_status(text, text, uuid, text) from public, anon, authenticated;
grant execute on function public.transition_stock_request_status(text, text, uuid, text) to service_role;

alter table if exists public.users enable row level security;
alter table if exists public.stock_requests enable row level security;
alter table if exists public.stock_request_items enable row level security;
alter table if exists public.received_stock enable row level security;
alter table if exists public.received_stock_items enable row level security;
alter table if exists public.inventory_balances enable row level security;
alter table if exists public.inventory_batches enable row level security;
alter table if exists public.audit_logs enable row level security;
alter table if exists public.lab_sessions enable row level security;

revoke all on table public.users, public.stock_requests, public.stock_request_items,
  public.received_stock, public.received_stock_items, public.inventory_balances,
  public.inventory_batches, public.audit_logs, public.lab_sessions
from anon, authenticated;
