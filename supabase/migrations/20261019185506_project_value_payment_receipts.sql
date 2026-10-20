do $$
begin
  if to_regclass('public.projects') is null or to_regclass('public.invoices') is null then
    raise exception 'Workspace base schema is missing.'
      using hint = 'Apply every migration in supabase/migrations in timestamp order, starting with 20261011214618_workspace_backend.sql, or run supabase db push against the correct linked project.';
  end if;
end;
$$;

alter table public.projects
  add column project_value numeric(14,2) not null default 0,
  add column project_currency text not null default 'USD';

alter table public.projects
  add constraint projects_value_nonnegative check (project_value >= 0),
  add constraint projects_currency_supported check (project_currency in ('UYU', 'USD', 'EUR'));

comment on column public.projects.project_value is
  'Private commercial value shown to workspace administrators.';
comment on column public.projects.project_currency is
  'Currency for the private project value. Deliberately omitted from the client portal payload.';

alter table public.invoices
  add column receipt_storage_path text,
  add column receipt_file_name text;

comment on column public.invoices.receipt_storage_path is
  'Private workspace-documents object path for the payment receipt. Deliberately omitted from the client portal payload.';
comment on column public.invoices.receipt_file_name is
  'Original payment receipt file name. Deliberately omitted from the client portal payload.';

create or replace function public.delete_workspace_project(p_project_id text)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  deletion_summary jsonb;
  file_paths jsonb;
begin
  if not (select private.is_workspace_admin()) then
    raise exception 'Only workspace administrators can delete projects.' using errcode = '42501';
  end if;

  if not exists (select 1 from public.projects where id = p_project_id) then
    raise exception 'Project not found.' using errcode = 'P0002';
  end if;

  select coalesce(jsonb_agg(path), '[]'::jsonb)
  into file_paths
  from (
    select storage_path as path
    from public.documents
    where project_id = p_project_id and storage_path is not null
    union all
    select storage_path as path
    from public.invoices
    where project_id = p_project_id and storage_path is not null
    union all
    select receipt_storage_path as path
    from public.invoices
    where project_id = p_project_id and receipt_storage_path is not null
  ) stored_files;

  select jsonb_build_object(
    'tasks', (select count(*) from public.tasks where project_id = p_project_id),
    'documents', (select count(*) from public.documents where project_id = p_project_id),
    'invoices', (select count(*) from public.invoices where project_id = p_project_id),
    'approvals', (select count(*) from public.approvals where project_id = p_project_id),
    'resources', (select count(*) from public.resources where project_id = p_project_id),
    'storagePaths', file_paths
  )
  into deletion_summary;

  delete from public.tasks where project_id = p_project_id;
  delete from public.documents where project_id = p_project_id;
  delete from public.invoices where project_id = p_project_id;
  delete from public.approvals where project_id = p_project_id;
  delete from public.resources where project_id = p_project_id;
  delete from public.projects where id = p_project_id;

  return deletion_summary;
end;
$$;

revoke all on function public.delete_workspace_project(text) from public;
revoke all on function public.delete_workspace_project(text) from anon;
grant execute on function public.delete_workspace_project(text) to authenticated;
