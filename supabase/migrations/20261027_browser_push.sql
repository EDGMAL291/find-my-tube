-- Device subscriptions and a durable push queue. No browser database grants.
begin;

create table if not exists public.web_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('lab', 'client')),
  recipient_key text not null,
  lab_session_id uuid references public.lab_sessions(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  order_id text references public.stock_requests(id) on delete cascade,
  endpoint_hash text not null check (length(endpoint_hash) = 64),
  endpoint text not null check (length(endpoint) between 10 and 4096),
  p256dh text not null,
  auth text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, recipient_key, endpoint_hash),
  check ((kind = 'lab' and lab_session_id is not null and user_id is not null and order_id is null and recipient_key = lab_session_id::text)
    or (kind = 'client' and lab_session_id is null and user_id is null and order_id is not null and recipient_key = order_id))
);
create index if not exists web_push_subscription_order on public.web_push_subscriptions(order_id);
create index if not exists web_push_subscription_expiry on public.web_push_subscriptions(expires_at);

create table if not exists public.web_push_jobs (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.web_push_subscriptions(id) on delete cascade,
  order_id text references public.stock_requests(id) on delete cascade,
  event_key text not null,
  payload jsonb not null,
  state text not null default 'pending' check (state in ('pending','sending','delivered','failed')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  lease_until timestamptz,
  expires_at timestamptz not null default now() + interval '1 day',
  last_error_code integer,
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  unique(subscription_id,event_key)
);
create index if not exists web_push_pending_jobs on public.web_push_jobs(state,available_at,lease_until);

alter table public.web_push_subscriptions enable row level security;
alter table public.web_push_jobs enable row level security;
revoke all on public.web_push_subscriptions, public.web_push_jobs from public, anon, authenticated;
grant all on public.web_push_subscriptions, public.web_push_jobs to service_role;

create or replace function public.queue_order_web_push(p_order_id text, p_event_key text, p_kind text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.web_push_jobs(subscription_id,order_id,event_key,payload)
  select subscription.id,p_order_id,p_event_key,jsonb_build_object(
    'v',1,'kind',case when p_kind='created' then 'lab' else 'client' end,
    'orderId',p_order_id,'eventId',p_event_key,
    'title',case when p_kind='created' then 'New stock order' else 'Stock order update' end,
    'body',case when p_kind='created' then 'A new stock request is waiting. Open the lab dashboard.'
      when p_kind='availability' then 'The lab has posted a stock availability update for your order.'
      else 'Your stock order has been updated. Open Track Orders for the latest details.' end)
  from public.web_push_subscriptions subscription
  left join public.lab_sessions session on session.id=subscription.lab_session_id
  left join public.users staff on staff.id=subscription.user_id
  where subscription.expires_at > now() and (
    (p_kind='created' and subscription.kind='lab' and session.expires_at > now() and staff.is_active
      and session.user_id=staff.id and staff.active_session_token_hash=session.token_hash)
    or (p_kind<>'created' and subscription.kind='client' and subscription.order_id=p_order_id))
  on conflict(subscription_id,event_key) do nothing;
end;
$$;

-- The last saved item, not the header insert, establishes a complete new order.
create or replace function public.web_push_after_order_items()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_expected integer; v_actual integer;
begin
  select line_item_count into v_expected from public.stock_requests where id=new.stock_request_id;
  select count(*) into v_actual from public.stock_request_items where stock_request_id=new.stock_request_id;
  if coalesce(v_expected,0)>0 and v_actual>=v_expected then
    perform public.queue_order_web_push(new.stock_request_id,'created:'||new.stock_request_id,'created');
  end if;
  return new;
exception when others then
  raise warning 'Web push queue unavailable for a saved stock order';
  return new;
end;
$$;
drop trigger if exists stock_items_web_push on public.stock_request_items;
create trigger stock_items_web_push after insert on public.stock_request_items for each row execute function public.web_push_after_order_items();

create or replace function public.web_push_after_order_update()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_old_status text; v_new_status text; v_old_items jsonb; v_new_items jsonb; v_revision integer;
begin
  v_old_status:=case when old.status in ('packed','processing','in-progress') then 'ready' when old.status in ('received','submitted') then 'pending' else old.status end;
  v_new_status:=case when new.status in ('packed','processing','in-progress') then 'ready' when new.status in ('received','submitted') then 'pending' else new.status end;
  v_revision:=jsonb_array_length(coalesce(new.status_history,'[]'::jsonb));
  if v_old_status is distinct from v_new_status then
    perform public.queue_order_web_push(new.id,'status:'||new.id||':'||v_revision::text||':'||v_new_status,'status');
  end if;
  select value->'unavailableItemIds' into v_old_items from jsonb_array_elements(coalesce(old.status_history,'[]'::jsonb)) with ordinality as events(value,position)
    where value->>'type'='item-availability-notice' order by position desc limit 1;
  select value->'unavailableItemIds' into v_new_items from jsonb_array_elements(coalesce(new.status_history,'[]'::jsonb)) with ordinality as events(value,position)
    where value->>'type'='item-availability-notice' order by position desc limit 1;
  if coalesce(v_old_items,'[]'::jsonb) is distinct from coalesce(v_new_items,'[]'::jsonb) then
    perform public.queue_order_web_push(new.id,'availability:'||new.id||':'||v_revision::text,'availability');
  end if;
  return new;
exception when others then
  raise warning 'Web push queue unavailable for a saved stock update';
  return new;
end;
$$;
drop trigger if exists stock_order_web_push on public.stock_requests;
create trigger stock_order_web_push after update on public.stock_requests for each row execute function public.web_push_after_order_update();

create or replace function public.claim_web_push_jobs(p_limit integer default 10)
returns setof public.web_push_jobs language sql security definer set search_path = public as $$
  update public.web_push_jobs job set state='sending', attempts=attempts+1, lease_until=now()+interval '5 minutes'
  where job.id in (
    select candidate.id from public.web_push_jobs candidate
    where candidate.expires_at>now() and candidate.attempts<5 and candidate.available_at<=now()
      and (candidate.state='pending' or (candidate.state='sending' and candidate.lease_until<now()))
    order by candidate.created_at,candidate.id
    for update skip locked limit greatest(1,least(coalesce(p_limit,10),20))
  ) returning job.*;
$$;
revoke all on function public.queue_order_web_push(text,text,text), public.web_push_after_order_items(), public.web_push_after_order_update(), public.claim_web_push_jobs(integer) from public, anon, authenticated;
grant execute on function public.queue_order_web_push(text,text,text), public.web_push_after_order_items(), public.web_push_after_order_update(), public.claim_web_push_jobs(integer) to service_role;
commit;
