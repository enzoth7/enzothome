-- Portal visits are recorded by a verified portal identity or a valid access link.
-- Only workspace administrators can read the log.
create table public.portal_access_logs (
  id bigint generated always as identity primary key,
  client_id text not null,
  actor_user_id uuid,
  actor_label text not null,
  event_type text not null check (event_type in ('login', 'view')),
  view_name text not null default '',
  created_at timestamptz not null default now(),
  constraint portal_access_logs_view_name_check check (
    (event_type = 'login' and view_name = '') or
    (event_type = 'view' and view_name in ('home', 'calendar', 'projects', 'documents', 'invoices', 'approvals', 'resources'))
  )
);
create index portal_access_logs_client_time_idx on public.portal_access_logs (client_id, created_at desc);
create index portal_access_logs_time_idx on public.portal_access_logs (created_at desc);
alter table public.portal_access_logs enable row level security;
revoke all on public.portal_access_logs from public, anon, authenticated;
grant select on public.portal_access_logs to authenticated;
create policy "workspace admins read portal access logs" on public.portal_access_logs
  for select to authenticated using ((select private.is_workspace_admin()));

create or replace function public.record_portal_activity(
  p_event_type text,
  p_view_name text default '',
  p_access_token uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_id text;
  v_actor_user_id uuid;
  v_actor_label text;
begin
  if p_event_type not in ('login', 'view')
    or (p_event_type = 'login' and p_view_name <> '')
    or (p_event_type = 'view' and p_view_name not in ('home', 'calendar', 'projects', 'documents', 'invoices', 'approvals', 'resources')) then
    raise exception 'Invalid portal activity';
  end if;

  if p_access_token is not null then
    if p_event_type = 'login' then raise exception 'A link cannot sign in'; end if;
    select client.id into v_client_id
    from public.clients client where client.portal_token = p_access_token;
    v_actor_label := 'Enlace de acceso';
  else
    v_actor_user_id := (select auth.uid());
    select client.id, coalesce(nullif(client.portal_username, ''), 'Usuario del portal')
      into v_client_id, v_actor_label
    from public.clients client where client.portal_auth_user_id = v_actor_user_id;
  end if;
  if v_client_id is null then
    raise exception 'Portal access denied' using errcode = '42501';
  end if;
  insert into public.portal_access_logs(client_id, actor_user_id, actor_label, event_type, view_name)
  values (v_client_id, v_actor_user_id, v_actor_label, p_event_type, p_view_name);
end;
$$;
revoke all on function public.record_portal_activity(text, text, uuid) from public, anon, authenticated;
grant execute on function public.record_portal_activity(text, text, uuid) to anon, authenticated;
