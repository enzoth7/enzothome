create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 240),
  event_date date not null,
  start_time time,
  end_time time,
  notes text not null default '',
  project_id text references public.projects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_events_time_order check (end_time is null or (start_time is not null and end_time > start_time))
);

create index calendar_events_event_date_idx on public.calendar_events(event_date);
alter table public.calendar_events enable row level security;
revoke all on public.calendar_events from public, anon, authenticated;
grant select, insert, update, delete on public.calendar_events to authenticated;
create policy "workspace admins manage calendar events" on public.calendar_events
  for all to authenticated
  using ((select private.is_workspace_admin()))
  with check ((select private.is_workspace_admin()));
