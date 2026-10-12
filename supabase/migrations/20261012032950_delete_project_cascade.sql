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

comment on function public.delete_workspace_project(text) is
  'Deletes one project and its project-scoped records in a single transaction. The client is preserved.';
