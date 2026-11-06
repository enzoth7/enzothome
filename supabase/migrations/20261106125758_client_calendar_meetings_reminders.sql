alter table public.clients add column time_zone text not null default '';
update public.clients set time_zone = case country when 'GB' then 'Europe/London' when 'UY' then 'America/Montevideo' else '' end
where country in ('GB', 'UY') and time_zone = '';
create or replace function public.validate_client_time_zone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.time_zone <> '' and not exists (select 1 from pg_catalog.pg_timezone_names where name = new.time_zone) then
    raise exception 'Invalid client time zone';
  end if;
  return new;
end;
$$;
create trigger validate_client_time_zone_before_write
before insert or update on public.clients
for each row execute function public.validate_client_time_zone();
alter table public.tasks add column start_date date;
alter table public.tasks add constraint tasks_start_before_due check (start_date is null or start_date <= due_date);

alter table public.calendar_events
  add column kind text not null default 'event',
  add column meeting_url text not null default '',
  add column time_zone text not null default 'America/Montevideo',
  add column starts_at timestamptz,
  add column ends_at timestamptz;

alter table public.calendar_events
  add constraint calendar_event_kind check (kind in ('event', 'meeting')),
  add constraint calendar_meeting_details check (kind <> 'meeting' or (start_time is not null and end_time is not null)),
  add constraint calendar_meeting_url check (meeting_url = '' or (length(meeting_url) <= 2048 and meeting_url ~* '^https?://'));

create or replace function public.normalize_calendar_event()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.time_zone) then
    raise exception 'Invalid time zone';
  end if;
  new.starts_at := case when new.start_time is null then null else (new.event_date + new.start_time) at time zone new.time_zone end;
  new.ends_at := case when new.end_time is null then null else (new.event_date + new.end_time) at time zone new.time_zone end;
  if tg_op = 'UPDATE' then new.updated_at := now(); end if;
  return new;
end;
$$;

create trigger normalize_calendar_event_before_write
before insert or update on public.calendar_events
for each row execute function public.normalize_calendar_event();

update public.calendar_events set time_zone = 'America/Montevideo';
create index calendar_events_starts_at_idx on public.calendar_events(starts_at) where kind = 'meeting';

-- Only meetings tied to this client's own projects are visible in the portal.
create or replace function public.get_portal_calendar(p_access_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'country', client.country,
    'timeZone', client.time_zone,
    'stageStarts', coalesce((select jsonb_agg(jsonb_build_object('id', task.id, 'start', coalesce(task.start_date::text, '')))
      from public.tasks task
      join public.projects project on project.id = task.project_id
      where project.client_id = client.id and task.kind <> 'Interna'), '[]'::jsonb),
    'events', coalesce((select jsonb_agg(jsonb_build_object(
      'id', event.id, 'title', event.title, 'event_date', event.event_date::text,
      'start_time', event.start_time::text, 'end_time', event.end_time::text,
      'notes', '', 'project_id', event.project_id, 'kind', event.kind,
      'meeting_url', event.meeting_url, 'time_zone', event.time_zone,
      'starts_at', event.starts_at, 'ends_at', event.ends_at
    ) order by event.starts_at)
      from public.calendar_events event
      join public.projects project on project.id = event.project_id
      where project.client_id = client.id and event.kind = 'meeting'), '[]'::jsonb)
  )
  from public.clients client
  where client.portal_token = p_access_token;
$$;

revoke all on function public.get_portal_calendar(uuid) from public;
grant execute on function public.get_portal_calendar(uuid) to anon, authenticated;

-- A unique claim per event revision and reminder offset avoids duplicate sends.
create table public.calendar_reminder_deliveries (
  event_id uuid not null references public.calendar_events(id) on delete cascade,
  reminder_minutes integer not null check (reminder_minutes in (30, 1440)),
  revision timestamptz not null,
  claimed_at timestamptz not null default now(),
  sent_at timestamptz,
  resend_email_id text,
  last_error text not null default '',
  primary key (event_id, reminder_minutes, revision)
);
alter table public.calendar_reminder_deliveries enable row level security;
revoke all on public.calendar_reminder_deliveries from public, anon, authenticated;
grant select, insert, update, delete on public.calendar_reminder_deliveries to service_role;
grant select on public.calendar_events, public.projects, public.clients to service_role;

create or replace function public.claim_due_calendar_reminders()
returns table (
  event_id uuid, reminder_minutes integer, revision timestamptz,
  title text, meeting_url text, starts_at timestamptz,
  client_name text, client_email text, client_language text, client_time_zone text
)
language sql
volatile
security invoker
set search_path = ''
as $$
  with due as (
    select event.id, reminder.minutes, event.updated_at
    from public.calendar_events event
    join public.projects project on project.id = event.project_id
    join public.clients client on client.id = project.client_id
    cross join (values (30), (1440)) reminder(minutes)
    where event.kind = 'meeting'
      and event.starts_at > now()
      and event.starts_at - make_interval(mins => reminder.minutes) <= now()
      and event.starts_at - make_interval(mins => reminder.minutes) > now() - interval '20 minutes'
      and client.email <> ''
  ), claimed as (
    insert into public.calendar_reminder_deliveries(event_id, reminder_minutes, revision)
    select due.id, due.minutes, due.updated_at from due
    on conflict (event_id, reminder_minutes, revision)
      do update set claimed_at = now()
      where calendar_reminder_deliveries.sent_at is null
        and calendar_reminder_deliveries.claimed_at < now() - interval '7 minutes'
    returning calendar_reminder_deliveries.event_id, calendar_reminder_deliveries.reminder_minutes, calendar_reminder_deliveries.revision
  )
  select claimed.event_id, claimed.reminder_minutes, claimed.revision,
    event.title, event.meeting_url, event.starts_at,
    client.name, client.email, client.language, client.time_zone
  from claimed
  join public.calendar_events event on event.id = claimed.event_id and event.updated_at = claimed.revision
  join public.projects project on project.id = event.project_id
  join public.clients client on client.id = project.client_id;
$$;

revoke all on function public.claim_due_calendar_reminders() from public, anon, authenticated;
grant execute on function public.claim_due_calendar_reminders() to service_role;

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

select vault.create_secret(replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''), 'calendar_reminder_secret')
where not exists (select 1 from vault.secrets where name = 'calendar_reminder_secret');

create or replace function public.get_calendar_reminder_secret()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'calendar_reminder_secret' limit 1;
$$;
revoke all on function public.get_calendar_reminder_secret() from public, anon, authenticated;
grant execute on function public.get_calendar_reminder_secret() to service_role;

-- Activate after the Edge Function is deployed, using this project's own URL.
create or replace function public.activate_calendar_reminders(p_project_url text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_project_url !~ '^https://[a-z0-9-]+[.]supabase[.]co$' then
    raise exception 'Invalid Supabase project URL';
  end if;
  if not exists (select 1 from vault.secrets where name = 'calendar_project_url') then
    perform vault.create_secret(p_project_url, 'calendar_project_url');
  end if;
  perform cron.schedule('send-calendar-reminders', '* * * * *', $job$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'calendar_project_url') || '/functions/v1/send-calendar-reminders',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'calendar_reminder_secret')),
      body := '{}'::jsonb
    );
  $job$);
end;
$$;
revoke all on function public.activate_calendar_reminders(text) from public, anon, authenticated;
grant execute on function public.activate_calendar_reminders(text) to service_role;
