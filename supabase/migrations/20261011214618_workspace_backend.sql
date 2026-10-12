create schema if not exists private;
revoke all on schema private from public;

create table public.workspace_admins (
  email text primary key,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint workspace_admin_email_lowercase check (email = lower(email))
);

create table public.clients (
  id text primary key,
  company text not null,
  name text not null default '',
  email text not null default '',
  language text not null default 'Español' check (language in ('Español', 'Inglés')),
  notes text not null default '',
  portal_token uuid not null default gen_random_uuid() unique,
  logo_path text,
  logo_file_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id text primary key,
  client_id text not null references public.clients(id) on delete restrict,
  title text not null,
  description text not null default '',
  status text not null,
  start_date date not null,
  due_date date not null,
  next_step text not null default '',
  intake jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_dates_valid check (due_date >= start_date)
);

create table public.tasks (
  id text primary key,
  project_id text not null references public.projects(id) on delete restrict,
  title text not null,
  status text not null,
  due_date date not null,
  owner text not null,
  kind text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id text primary key,
  project_id text not null references public.projects(id) on delete restrict,
  title text not null,
  kind text not null,
  status text not null,
  document_date date not null,
  content text not null default '',
  storage_path text,
  file_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id text primary key,
  project_id text not null references public.projects(id) on delete restrict,
  title text not null,
  number text not null unique,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null check (currency in ('USD', 'UYU', 'EUR', 'GBP')),
  due_date date not null,
  paid numeric(14,2) not null default 0 check (paid >= 0),
  payment_info text not null default '',
  invoice_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoice_paid_valid check (paid <= amount)
);

create table public.approvals (
  id text primary key,
  project_id text not null references public.projects(id) on delete restrict,
  title text not null,
  description text not null default '',
  status text not null default 'Pendiente',
  due_date date not null,
  response text not null default '',
  responded_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resources (
  id text primary key,
  project_id text not null references public.projects(id) on delete restrict,
  title text not null,
  url text not null,
  kind text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.updates (
  id text primary key,
  project_id text not null references public.projects(id) on delete restrict,
  title text not null,
  content text not null,
  update_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id text primary key,
  client_id text not null references public.clients(id) on delete restrict,
  title text not null,
  content text not null,
  kind text not null,
  message_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_client_id_idx on public.projects(client_id);
create index tasks_project_id_idx on public.tasks(project_id);
create index documents_project_id_idx on public.documents(project_id);
create index invoices_project_id_idx on public.invoices(project_id);
create index approvals_project_id_idx on public.approvals(project_id);
create index resources_project_id_idx on public.resources(project_id);
create index updates_project_id_idx on public.updates(project_id);
create index messages_client_id_idx on public.messages(client_id);

create or replace function private.is_workspace_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.workspace_admins administrator
      where administrator.email = lower(coalesce((select auth.jwt() ->> 'email'), ''))
        and administrator.active
    );
$$;

revoke all on function private.is_workspace_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_workspace_admin() to authenticated;

alter table public.workspace_admins enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.documents enable row level security;
alter table public.invoices enable row level security;
alter table public.approvals enable row level security;
alter table public.resources enable row level security;
alter table public.updates enable row level security;
alter table public.messages enable row level security;

create policy "workspace admins manage administrators" on public.workspace_admins
  for all to authenticated
  using ((select private.is_workspace_admin()))
  with check ((select private.is_workspace_admin()));
create policy "workspace admins manage clients" on public.clients
  for all to authenticated
  using ((select private.is_workspace_admin()))
  with check ((select private.is_workspace_admin()));
create policy "workspace admins manage projects" on public.projects
  for all to authenticated
  using ((select private.is_workspace_admin()))
  with check ((select private.is_workspace_admin()));
create policy "workspace admins manage tasks" on public.tasks
  for all to authenticated
  using ((select private.is_workspace_admin()))
  with check ((select private.is_workspace_admin()));
create policy "workspace admins manage documents" on public.documents
  for all to authenticated
  using ((select private.is_workspace_admin()))
  with check ((select private.is_workspace_admin()));
create policy "workspace admins manage invoices" on public.invoices
  for all to authenticated
  using ((select private.is_workspace_admin()))
  with check ((select private.is_workspace_admin()));
create policy "workspace admins manage approvals" on public.approvals
  for all to authenticated
  using ((select private.is_workspace_admin()))
  with check ((select private.is_workspace_admin()));
create policy "workspace admins manage resources" on public.resources
  for all to authenticated
  using ((select private.is_workspace_admin()))
  with check ((select private.is_workspace_admin()));
create policy "workspace admins manage updates" on public.updates
  for all to authenticated
  using ((select private.is_workspace_admin()))
  with check ((select private.is_workspace_admin()));
create policy "workspace admins manage messages" on public.messages
  for all to authenticated
  using ((select private.is_workspace_admin()))
  with check ((select private.is_workspace_admin()));

grant select, insert, update, delete on table
  public.workspace_admins,
  public.clients,
  public.projects,
  public.tasks,
  public.documents,
  public.invoices,
  public.approvals,
  public.resources,
  public.updates,
  public.messages
to authenticated;

create or replace function public.get_portal_workspace(p_access_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'version', 1,
    'clients', jsonb_build_array(jsonb_build_object(
      'id', client.id,
      'company', client.company,
      'name', client.name,
      'email', client.email,
      'language', client.language,
      'notes', '',
      'logoFileId', coalesce(client.logo_path, ''),
      'logoFileName', coalesce(client.logo_file_name, '')
    )),
    'projects', coalesce((select jsonb_agg(jsonb_build_object(
      'id', project.id,
      'clientId', project.client_id,
      'title', project.title,
      'description', project.description,
      'status', project.status,
      'start', project.start_date::text,
      'due', project.due_date::text,
      'nextStep', project.next_step,
      'intake', project.intake
    ) order by project.created_at) from public.projects project where project.client_id = client.id), '[]'::jsonb),
    'tasks', coalesce((select jsonb_agg(jsonb_build_object(
      'id', task.id,
      'projectId', task.project_id,
      'title', task.title,
      'status', task.status,
      'due', task.due_date::text,
      'owner', task.owner,
      'kind', task.kind
    ) order by task.created_at) from public.tasks task join public.projects project on project.id = task.project_id where project.client_id = client.id and task.kind <> 'Interna'), '[]'::jsonb),
    'documents', coalesce((select jsonb_agg(jsonb_build_object(
      'id', document.id,
      'projectId', document.project_id,
      'title', document.title,
      'kind', document.kind,
      'status', document.status,
      'date', document.document_date::text,
      'content', document.content,
      'fileId', coalesce(document.storage_path, ''),
      'fileName', coalesce(document.file_name, '')
    ) order by document.created_at) from public.documents document join public.projects project on project.id = document.project_id where project.client_id = client.id and document.status <> 'Borrador'), '[]'::jsonb),
    'invoices', coalesce((select jsonb_agg(jsonb_build_object(
      'id', invoice.id,
      'projectId', invoice.project_id,
      'title', invoice.title,
      'number', invoice.number,
      'amount', invoice.amount,
      'currency', invoice.currency,
      'due', invoice.due_date::text,
      'paid', invoice.paid,
      'paymentInfo', invoice.payment_info,
      'date', invoice.invoice_date::text
    ) order by invoice.created_at) from public.invoices invoice join public.projects project on project.id = invoice.project_id where project.client_id = client.id), '[]'::jsonb),
    'approvals', coalesce((select jsonb_agg(jsonb_build_object(
      'id', approval.id,
      'projectId', approval.project_id,
      'title', approval.title,
      'description', approval.description,
      'status', approval.status,
      'due', approval.due_date::text,
      'response', approval.response,
      'respondedAt', coalesce(approval.responded_at::text, '')
    ) order by approval.created_at) from public.approvals approval join public.projects project on project.id = approval.project_id where project.client_id = client.id), '[]'::jsonb),
    'resources', coalesce((select jsonb_agg(jsonb_build_object(
      'id', resource.id,
      'projectId', resource.project_id,
      'title', resource.title,
      'url', resource.url,
      'kind', resource.kind,
      'description', resource.description
    ) order by resource.created_at) from public.resources resource join public.projects project on project.id = resource.project_id where project.client_id = client.id), '[]'::jsonb),
    'updates', coalesce((select jsonb_agg(jsonb_build_object(
      'id', update_item.id,
      'projectId', update_item.project_id,
      'title', update_item.title,
      'content', update_item.content,
      'date', update_item.update_date::text
    ) order by update_item.update_date desc, update_item.created_at desc) from public.updates update_item join public.projects project on project.id = update_item.project_id where project.client_id = client.id), '[]'::jsonb),
    'messages', '[]'::jsonb
  )
  from public.clients client
  where client.portal_token = p_access_token;
$$;

create or replace function public.portal_respond_to_approval(
  p_access_token uuid,
  p_approval_id text,
  p_status text,
  p_response text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('Aprobada', 'Cambios solicitados') then
    raise exception 'Estado no permitido';
  end if;
  if p_status = 'Cambios solicitados' and btrim(coalesce(p_response, '')) = '' then
    raise exception 'La respuesta es obligatoria';
  end if;

  update public.approvals approval
  set status = p_status,
      response = left(btrim(coalesce(p_response, '')), 10000),
      responded_at = current_date,
      updated_at = now()
  from public.projects project, public.clients client
  where approval.id = p_approval_id
    and project.id = approval.project_id
    and client.id = project.client_id
    and client.portal_token = p_access_token;
  return found;
end;
$$;

create or replace function public.portal_save_intake(
  p_access_token uuid,
  p_project_id text,
  p_intake jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if jsonb_typeof(p_intake) <> 'object'
    or btrim(coalesce(p_intake ->> 'contact', '')) = ''
    or btrim(coalesce(p_intake ->> 'goal', '')) = ''
    or btrim(coalesce(p_intake ->> 'success', '')) = '' then
    raise exception 'Ficha incompleta';
  end if;

  update public.projects project
  set intake = jsonb_build_object(
        'contact', left(btrim(p_intake ->> 'contact'), 4000),
        'goal', left(btrim(p_intake ->> 'goal'), 4000),
        'success', left(btrim(p_intake ->> 'success'), 4000),
        'context', left(btrim(coalesce(p_intake ->> 'context', '')), 4000),
        'date', current_date::text
      ),
      updated_at = now()
  from public.clients client
  where project.id = p_project_id
    and client.id = project.client_id
    and client.portal_token = p_access_token;
  return found;
end;
$$;

create or replace function public.portal_complete_task(
  p_access_token uuid,
  p_task_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.tasks task
  set status = 'Completada', updated_at = now()
  from public.projects project, public.clients client
  where task.id = p_task_id
    and task.owner = 'Cliente'
    and task.kind <> 'Interna'
    and project.id = task.project_id
    and client.id = project.client_id
    and client.portal_token = p_access_token;
  return found;
end;
$$;

revoke all on function public.get_portal_workspace(uuid) from public;
revoke all on function public.portal_respond_to_approval(uuid, text, text, text) from public;
revoke all on function public.portal_save_intake(uuid, text, jsonb) from public;
revoke all on function public.portal_complete_task(uuid, text) from public;
grant execute on function public.get_portal_workspace(uuid) to anon, authenticated;
grant execute on function public.portal_respond_to_approval(uuid, text, text, text) to anon, authenticated;
grant execute on function public.portal_save_intake(uuid, text, jsonb) to anon, authenticated;
grant execute on function public.portal_complete_task(uuid, text) to anon, authenticated;

insert into public.workspace_admins(email)
values ('enzothome1@gmail.com')
on conflict (email) do update set active = true;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('client-logos', 'client-logos', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('workspace-documents', 'workspace-documents', false, 20971520, null)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "workspace admins manage logos" on storage.objects
  for all to authenticated
  using (bucket_id = 'client-logos' and (select private.is_workspace_admin()))
  with check (bucket_id = 'client-logos' and (select private.is_workspace_admin()));
create policy "workspace admins manage documents" on storage.objects
  for all to authenticated
  using (bucket_id = 'workspace-documents' and (select private.is_workspace_admin()))
  with check (bucket_id = 'workspace-documents' and (select private.is_workspace_admin()));

alter publication supabase_realtime add table
  public.clients,
  public.projects,
  public.tasks,
  public.documents,
  public.invoices,
  public.approvals,
  public.resources,
  public.updates,
  public.messages;
