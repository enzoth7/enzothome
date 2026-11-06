-- Portal access is a bearer token. Both writes verify the client and project
-- inside the function; direct calendar_events writes remain admin-only.
-- Every edit needs a distinct revision, including two edits in one transaction.
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
  if tg_op = 'UPDATE' then new.updated_at := greatest(clock_timestamp(), old.updated_at + interval '1 microsecond'); end if;
  return new;
end;
$$;

alter table public.calendar_reminder_deliveries
  drop constraint calendar_reminder_deliveries_reminder_minutes_check,
  alter column claimed_at drop not null;
alter table public.calendar_reminder_deliveries
  add constraint calendar_reminder_deliveries_reminder_minutes_check
  check (reminder_minutes in (-1, 0, 30, 1440));

create or replace function public.portal_create_meeting(
  p_access_token uuid,
  p_project_id text,
  p_title text,
  p_event_date date,
  p_start_time time,
  p_end_time time,
  p_meeting_url text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_id text;
  v_time_zone text;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_event_id uuid;
  v_revision timestamptz;
begin
  select client.id, coalesce(nullif(client.time_zone, ''), 'America/Montevideo')
    into v_client_id, v_time_zone
  from public.clients client
  where client.portal_token = p_access_token;
  if v_client_id is null or not exists (
    select 1 from public.projects project
    where project.id = p_project_id and project.client_id = v_client_id
  ) then
    raise exception 'Meeting project is not available in this portal' using errcode = '42501';
  end if;
  if p_title is null or length(btrim(p_title)) not between 1 and 240
    or p_event_date is null or p_start_time is null or p_end_time is null
    or p_end_time <= p_start_time then
    raise exception 'Invalid meeting details';
  end if;
  if p_meeting_url is null or (p_meeting_url <> '' and (
    length(p_meeting_url) > 2048 or p_meeting_url !~* '^https?://'
  )) then
    raise exception 'Invalid meeting link';
  end if;
  v_starts_at := (p_event_date + p_start_time) at time zone v_time_zone;
  v_ends_at := (p_event_date + p_end_time) at time zone v_time_zone;
  if v_starts_at <= now() or v_ends_at <= v_starts_at
    or (v_starts_at at time zone v_time_zone)::date <> p_event_date
    or (v_starts_at at time zone v_time_zone)::time <> p_start_time
    or (v_ends_at at time zone v_time_zone)::date <> p_event_date
    or (v_ends_at at time zone v_time_zone)::time <> p_end_time then
    raise exception 'Meeting time is not valid in the client time zone';
  end if;
  insert into public.calendar_events (
    title, event_date, start_time, end_time, project_id, kind,
    meeting_url, time_zone
  ) values (
    btrim(p_title), p_event_date, p_start_time, p_end_time, p_project_id,
    'meeting', p_meeting_url, v_time_zone
  ) returning id, updated_at into v_event_id, v_revision;
  insert into public.calendar_reminder_deliveries(event_id, reminder_minutes, revision, claimed_at)
  values (v_event_id, -1, v_revision, null);
  return v_event_id;
end;
$$;
revoke all on function public.portal_create_meeting(uuid, text, text, date, time, time, text) from public, anon, authenticated;
grant execute on function public.portal_create_meeting(uuid, text, text, date, time, time, text) to anon, authenticated;

create or replace function public.portal_reschedule_meeting(
  p_access_token uuid,
  p_event_id uuid,
  p_expected_starts_at timestamptz,
  p_expected_ends_at timestamptz,
  p_event_date date,
  p_start_time time,
  p_end_time time
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event record;
  v_time_zone text;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_revision timestamptz;
begin
  select event.starts_at, event.ends_at, client.time_zone
    into v_event
  from public.calendar_events event
  join public.projects project on project.id = event.project_id
  join public.clients client on client.id = project.client_id
  where event.id = p_event_id and event.kind = 'meeting'
    and client.portal_token = p_access_token
  for update of event;
  if not found or v_event.ends_at <= now()
    or v_event.starts_at is distinct from p_expected_starts_at
    or v_event.ends_at is distinct from p_expected_ends_at then
    return false;
  end if;
  if p_event_date is null or p_start_time is null or p_end_time is null
    or p_end_time <= p_start_time then
    raise exception 'Invalid meeting time';
  end if;
  v_time_zone := coalesce(nullif(v_event.time_zone, ''), 'America/Montevideo');
  v_starts_at := (p_event_date + p_start_time) at time zone v_time_zone;
  v_ends_at := (p_event_date + p_end_time) at time zone v_time_zone;
  if v_starts_at <= now() or v_ends_at <= v_starts_at
    or (v_starts_at at time zone v_time_zone)::date <> p_event_date
    or (v_starts_at at time zone v_time_zone)::time <> p_start_time
    or (v_ends_at at time zone v_time_zone)::date <> p_event_date
    or (v_ends_at at time zone v_time_zone)::time <> p_end_time then
    raise exception 'Meeting time is not valid in the client time zone';
  end if;
  update public.calendar_events
  set event_date = p_event_date, start_time = p_start_time,
      end_time = p_end_time, time_zone = v_time_zone
  where id = p_event_id
  returning updated_at into v_revision;
  insert into public.calendar_reminder_deliveries(event_id, reminder_minutes, revision, claimed_at)
  values (p_event_id, 0, v_revision, null);
  return true;
end;
$$;
revoke all on function public.portal_reschedule_meeting(uuid, uuid, timestamptz, timestamptz, date, time, time) from public, anon, authenticated;
grant execute on function public.portal_reschedule_meeting(uuid, uuid, timestamptz, timestamptz, date, time, time) to anon, authenticated;

-- Offsets -1 and 0 are queued confirmations for portal-created and
-- client-rescheduled meetings. The existing offsets remain due-time reminders.
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
    union all
    select event.id, delivery.reminder_minutes, delivery.revision
    from public.calendar_reminder_deliveries delivery
    join public.calendar_events event on event.id = delivery.event_id and event.updated_at = delivery.revision
    join public.projects project on project.id = event.project_id
    join public.clients client on client.id = project.client_id
    where delivery.reminder_minutes in (-1, 0)
      and delivery.sent_at is null and event.starts_at > now()
      and client.email <> ''
  ), claimed as (
    insert into public.calendar_reminder_deliveries(event_id, reminder_minutes, revision)
    select due.id, due.minutes, due.updated_at from due
    on conflict (event_id, reminder_minutes, revision)
      do update set claimed_at = now()
      where calendar_reminder_deliveries.sent_at is null
        and (calendar_reminder_deliveries.claimed_at is null
          or calendar_reminder_deliveries.claimed_at < now() - interval '7 minutes')
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
